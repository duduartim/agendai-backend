import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";

dotenv.config();

const app = express();
const server = http.createServer(app);

// =========================
// CORS + JSON
// =========================
const allowedOrigins = [
  "http://localhost:3000",              // frontend local
  "https://agendai-frontend.vercel.app" // frontend em produção
];

app.use(
  cors({
    origin: (origin, callback) => {
      // permite também chamadas sem origin (Postman, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"))
