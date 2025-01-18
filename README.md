# Christology WhatsApp AI Chatbot

This repository contains a WhatsApp chatbot that integrates with OpenAI's language models to provide intelligent, context-aware answers to user queries. The chatbot utilizes the `whatsapp-web.js` library for WhatsApp integration and LangChain for creating and managing retrieval-augmented generation (RAG) chains.

---

## Features

- **WhatsApp Integration**: Connects to WhatsApp via `whatsapp-web.js` for seamless communication.
- **AI-Powered Responses**: Uses OpenAI's Gemini model for natural language understanding and response generation.
- **RAG Chain**: Retrieves relevant data from a SQLite database to augment AI answers with context.
- **Real-Time QR Code Login**: Authenticates with WhatsApp via QR code.
- **Persistent Database**: Stores questions and answers in a SQLite database.
- **Custom Use Cases**: Easily adaptable for different datasets and domains.

---

## Prerequisites

Ensure you have the following installed on your system:

1. Node.js (v16 or above)
2. npm or yarn
3. SQLite3
4. Google API Key with access to the Gemini model

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/whatsapp-ai-chatbot.git
   cd whatsapp-ai-chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   API_KEY=your_google_api_key
   GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json
   ```

4. **Set up SQLite database:**
   - Use the `gotquestions.db` database from the [Gotquestion-Chatbot-Data-Scrape repository](https://github.com/jhenterprise/Gotquestion-Chatbot-Data-Scrape).
   - The database contains Jesus-related questions scraped from that repository.

---

## Usage

1. **Run the chatbot:**
   ```bash
   node index.js
   ```

2. **Authenticate with WhatsApp:**
   - Scan the displayed QR code using the WhatsApp app on your phone.

3. **Interact with the chatbot:**
   - Send `!ping` to test the connection.
   - Send `!ask your question` to ask a question and receive AI-generated answers based on the database context.

---

## Use Cases

The chatbot can be adapted for various use cases, such as:

1. **Biblical Studies and Evangelism:**
   - Answer questions about Jesus, the Bible, or Christianity using the preloaded database.

2. **Customer Support:**
   - Integrate with a product FAQ database to provide automated customer service.

3. **Education:**
   - Serve as a tutor for specific subjects by using relevant datasets.

4. **Company Knowledge Base:**
   - Provide employees with instant answers to internal company processes and FAQs.

5. **Custom Applications:**
   - Replace the dataset with domain-specific data to create niche chatbots for industries like healthcare, legal, or technical support.

---

## Project Structure

- `index.js`: Main application logic.
- `.env`: Environment variables.
- `gotquestions.db`: SQLite database storing question-answer pairs, sourced from the [Gotquestion-Chatbot-Data-Scrape repository](https://github.com/jhenterprise/Gotquestion-Chatbot-Data-Scrape).
- `package.json`: Project dependencies.

---

## Dependencies

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [LangChain](https://www.langchain.com/)
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal)
- [puppeteer](https://pptr.dev/)
- [dotenv](https://github.com/motdotla/dotenv)
- [sqlite](https://github.com/TryGhost/node-sqlite3)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Special thanks to the developers of `whatsapp-web.js` and LangChain for their amazing libraries.
- Thanks to [Gotquestion-Chatbot-Data-Scrape](https://github.com/jhenterprise/Gotquestion-Chatbot-Data-Scrape) for the initial database.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to contribute to this project.

---

## Contact

For inquiries or support, please contact [jackson.harry.dev@gmail.com].

