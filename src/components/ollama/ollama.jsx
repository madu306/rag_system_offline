export async function enviarMensagemIA(mensagem) {
  const payload = {
    input_value: mensagem,
    output_type: "chat",
    input_type: "chat",
    session_id: "user_1",
  };

  try {
    const response = await fetch(
      "http://127.0.0.1:7860/api/v1/run/211fb1de-9f5a-4f0a-bec5-c344631e22d5",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    // 🚀 caminho correto
    const respostaIA = data.outputs[0].results.message.data.text;

    return respostaIA;
  } catch (err) {
    console.error("Erro IA:", err);
    return "Erro na IA";
  }
}


