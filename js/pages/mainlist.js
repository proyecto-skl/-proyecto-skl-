export async function render(container) {
  // Obtenemos la URL exacta de dónde está parado este archivo
  const urlDeEsteScript = import.meta.url;
  
  // Obtenemos la URL de la raíz de la página web
  const urlRaizWeb = window.location.origin + window.location.pathname;

  container.innerHTML = `
    <div class="state-message" style="text-align: left; padding: 20px; line-height: 1.6;">
      <h3 style="color: #ffb400;">🔍 Modo Diagnóstico de Rutas</h3>
      <p><strong>Raíz de la web:</strong> <code style="background:#222; padding:2px 6px;">${urlRaizWeb}</code></p>
      <p><strong>Este script está en:</strong> <code style="background:#222; padding:2px 6px;">${urlDeEsteScript}</code></p>
      <p><strong>Intentando buscar en:</strong> <code style="background:#222; padding:2px 6px;">data/levels/_list.json</code></p>
      <hr style="border-color: #333;">
      <p id="test-resultado" style="color: #ff4545;">Probando conexión...</p>
    </div>
  `;

  // Hacemos un fetch de prueba y atrapamos la URL exacta generada
  try {
    const respuestaPrueba = await fetch('data/levels/_list.json');
    if (!respuestaPrueba.ok) {
      document.getElementById('test-resultado').innerHTML = `
        ❌ El servidor respondió, pero el archivo NO existe ahí.<br>
        <strong>Código de Error:</strong> ${respuestaPrueba.status} (${respuestaPrueba.statusText})<br>
        <strong>Ruta real que falló:</strong> <code style="background:#222; color:#fff; padding:2px 6px;">${respuestaPrueba.url}</code>
      `;
    } else {
      document.getElementById('test-resultado').style.color = "#00ff66";
      document.getElementById('test-resultado').innerHTML = "¡Éxito! El archivo fue encontrado.";
    }
  } catch (err) {
    document.getElementById('test-resultado').innerHTML = `❌ Error de red catastrófico: ${err.message}`;
  }
}
