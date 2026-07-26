import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is up and running on port ${PORT}`);
  console.log(`📄 API Documentation available at http://localhost:${PORT}/api-docs\n`);
});
