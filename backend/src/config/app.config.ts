export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
  },
});
