const API_URL = "http://localhost:5000/chat";

export const sendMessage = async (content, parentId) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, parentId }),
  });

  return res.json();
};