const { createRequestHandler } = require("@remix-run/vercel");

module.exports = async (req, res) => {
  try {
    const build = require("../build/server/index.js");
    const handler = createRequestHandler({ 
      build: build.default || build,
      mode: process.env.NODE_ENV === "development" ? "development" : "production"
    });
    
    return await handler(req, res);
  } catch (error) {
    console.error("API Handler Error:", error);
    return res.status(500).json({ 
      error: "Internal Server Error",
      message: error.message
    });
  }
};
