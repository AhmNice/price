import express from "express";
const healthRoute = express.Router();

healthRoute.get("/", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

export default healthRoute;