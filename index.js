import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import puppeteer from "puppeteer";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Document } from "langchain/document";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createRetrievalChain } from "langchain/chains/retrieval";

// Load environment variables
dotenv.config();

// Set up Google service account credentials
// const keyPath = "key.json";
// process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

const { Client, LocalAuth } = pkg;

// Initialize the AI model
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.API_KEY,
  model: "gemini-1.5-flash",
  temperature: 0.0,
});

async function initializeVectorStore() {
  // Connect to SQLite database
  const db = await open({
    filename: "gotquestions.db",
    driver: sqlite3.Database,
  });

  // Fetch questions and answers
  const rows = await db.all("SELECT id, question, answer FROM questions");

  if (!rows || rows.length === 0) {
    throw new Error("No data found in SQLite database.");
  }

  // Prepare documents
  const documents = rows.map((row) => {
    return new Document({
      pageContent: `${row.question} ${row.answer}`,
      metadata: { id: row.id, question: row.question },
    });
  });

  // Initialize embeddings
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.API_KEY,
  });

  // Create a vector store from the documents
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  console.log("Vector store initialized with SQLite data.");
  return vectorStore.asRetriever();
}

async function initializeRAGChain(retriever) {
  const systemTemplate = `
  ## About
  You are a knowledgeable and respectful Christian theology chatbot trained exclusively to answer Christian religious questions. Your focus includes the Bible, Christian doctrine, Christology, apologetics, church history, and faith-based living. Do not entertain questions outside of Christian theology or practice. If a user asks about a topic unrelated to the Christian faith, kindly but firmly explain that you are only equipped to address questions rooted in Christianity.

  Your responses should be:
  
  Grounded in biblical truth and reflect historical Christian orthodoxy
  
  Gracious in tone, guided by the fruit of the Spirit (Galatians 5:22–23)
  
  Supported with Scripture where appropriate (include references)
  
  Aware of theological diversity (Protestant, Catholic, Orthodox) when relevant
  
  Firm in defending core tenets of the Christian faith (e.g., deity of Christ, resurrection, Trinity)
  
  Free from speculation and faithful to doctrinal integrity
  
  When answering apologetics questions, respond with clear, reasoned arguments rooted in classical or presuppositional apologetics.
  
  Example Christian Questions:
  “What is the hypostatic union?”
  
  “How can we know the Bible is trustworthy?”
  
  “Why does God allow suffering?”
  
  “What is the difference between justification and sanctification?”
  
  “How do Christians explain the Trinity logically?”
  
  If unsure of an answer or if the topic is controversial, clearly state that and offer Scripture or trusted resources for further study.

## Task
Answer only Christian theological questions clearly and concisely based on the context provided. If a question is not related to the Christian faith, politely decline to answer it and redirect the user to relevant resources or topics within the Christian tradition. Respond in one paragraph. If unsure, admit it politely.

{context}
`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);

  const questionAnswerChain = await createStuffDocumentsChain({
    llm: model,
    prompt,
  });

  return createRetrievalChain({
    retriever,
    combineDocsChain: questionAnswerChain,
  });
}

async function handleChat(ragChain, inputMessage) {
  try {
    const relevantData = await ragChain.invoke({ input: inputMessage });

    console.log("Input:", inputMessage);
    console.log("Relevant data:", relevantData);

    if (relevantData && relevantData.answer) {
      return relevantData.answer;
    }

    return "Sorry, I don't have an answer for that.";
  } catch (error) {
    console.error("Error in handleChat:", error);
    return "An error occurred while processing your request.";
  }
}

async function main() {
  const retriever = await initializeVectorStore();
  const ragChain = await initializeRAGChain(retriever);

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      executablePath: puppeteer.executablePath(),
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    console.log("Scan this QR code with your WhatsApp to log in:");
    qrcode.generate(qr, { small: true });
  });

  client.on("authenticated", () =>
    console.log("WhatsApp client authenticated!")
  );
  client.on("ready", () => console.log("WhatsApp client is ready!"));

  client.on("message", async (msg) => {
    console.log(`Message from ${msg.from}: ${msg.body}`);
    const replyText = await (async () => {
      if (msg.body === "!ping") return "pong";
      // if (msg.body.startsWith("!ask ")) {
        const question = msg.body;
        return await handleChat(ragChain, question);
      // }
      return null;
    })();

    if (replyText) {
      await msg.reply(replyText);
    }
  });

  client.on("auth_failure", (err) => {
    console.error("Authentication failure:", err);
  });

  client.on("disconnected", (reason) => {
    console.log("WhatsApp client disconnected:", reason);
    process.exit();
  });

  client.initialize();
}

main().catch((err) => console.error("Error in main:", err));
