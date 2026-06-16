
const collectedTextsArray = [];

function recolectar() {
	console.log("recolectar");
	const targetNode = document.querySelector('div[aria-label="Subtítulos"]');
	const arrayNode = Array.from(targetNode.children);
	for (let j = 0; j < arrayNode.length -3; j++){
		const childElement = arrayNode[j];
		const text = childElement.innerText.trim();
		if (!text) {
			return;
		}
		const arreglo = text.toUpperCase().split('\n');
		let texto = "[" + arreglo[0] + "]\n" + arreglo[1];
		let encontrado = false;
		for (let i = 0; i < collectedTextsArray.length; i++) {
			const currentItem = collectedTextsArray[i];
			if (currentItem[i] === texto) {
				encontrado = true;
				break;
			}
			if (texto.includes(currentItem)) {
				encontrado = true;
				collectedTextsArray[i] = texto;
				break;
			}
		}
		if (!encontrado) {
			collectedTextsArray.push(texto);
		}	     
	}
}

function descargar() {
	recolectar();
	console.log("descargar");
	if (collectedTextsArray.length > 0) {
		let resultado = collectedTextsArray.join("\n");
		const blob = new Blob([resultado], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const meetCode = window.location.pathname.replace(/^\//, "") || "meet";
			a.download = meetCode + "_" + new Date().toISOString().replace(/[:.]/g, '-') + ".txt";
		a.click();
		URL.revokeObjectURL(url);
	}
}

descargar();

window.addEventListener('beforeunload', function() {
     descargar();
});

let idRecolectar = setInterval(recolectar, 60 * 1000);
let idDescargar = setInterval(descargar, 20 * 60 * 1000);





