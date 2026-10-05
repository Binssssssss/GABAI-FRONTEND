import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL ||
    "http://192.168.1.39:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  console.log("========== API REQUEST ==========");
  console.log("BASE URL:", config.baseURL);
  console.log("URL:", config.url);
  console.log("METHOD:", config.method);

  const session = await AsyncStorage.getItem("gabai.auth.session");

  console.log("AUTH SESSION:", session);

  if (session) {
    try {
      const parsed = JSON.parse(session);

      console.log(
        "HAS ACCESS TOKEN:",
        !!parsed?.token
      );

      if (parsed?.token) {
        config.headers.Authorization =
          `Bearer ${parsed.token}`;

        console.log("AUTH HEADER ATTACHED");
      }
    } catch (error) {
      console.log("SESSION PARSE ERROR:", error);
    }
  }

  console.log("FULL REQUEST URL:", `${config.baseURL}${config.url}`);
  console.log("================================");

  return config;
});

export default api;