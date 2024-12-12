document.addEventListener('DOMContentLoaded', function () {
    const firmaCanvas = document.getElementById('firma-canvas');
    const ctx = firmaCanvas.getContext('2d');
    let drawing = false;

    // Calcular las coordenadas correctas del mouse o toque
    function getMousePos(event) {
        const rect = firmaCanvas.getBoundingClientRect();
        const scaleX = firmaCanvas.width / rect.width;  // Escalar según tamaño canvas
        const scaleY = firmaCanvas.height / rect.height;
        const x = (event.clientX || event.touches[0].clientX) - rect.left;
        const y = (event.clientY || event.touches[0].clientY) - rect.top;
        return { x: x * scaleX, y: y * scaleY };
    }

    // Iniciar el dibujo
    function startDrawing(event) {
        event.preventDefault(); // Evitar el desplazamiento de la página en dispositivos móviles
        drawing = true;
        const pos = getMousePos(event);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    // Dibujar en el canvas
    function draw(event) {
        if (!drawing) return;
        const pos = getMousePos(event);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    // Detener el dibujo
    function stopDrawing(event) {
        event.preventDefault(); // Evitar el desplazamiento de la página
        drawing = false;
        ctx.beginPath();
    }

    // Manejar eventos de mouse
    firmaCanvas.addEventListener('mousedown', startDrawing);
    firmaCanvas.addEventListener('mousemove', draw);
    firmaCanvas.addEventListener('mouseup', stopDrawing);
    firmaCanvas.addEventListener('mouseleave', stopDrawing);

    // Manejar eventos táctiles
    firmaCanvas.addEventListener('touchstart', startDrawing);
    firmaCanvas.addEventListener('touchmove', draw);
    firmaCanvas.addEventListener('touchend', stopDrawing);
    firmaCanvas.addEventListener('touchcancel', stopDrawing);

    // Limpiar la firma
    document.getElementById('clear-btn').addEventListener('click', function () {
        ctx.clearRect(0, 0, firmaCanvas.width, firmaCanvas.height);
    });

    // Función para obtener la hora en formato de 12 horas (AM/PM)
    function formatAMPM(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // La hora en formato de 12 horas
        hours = hours ? hours : 12; // El 0 debe ser 12
        const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutesFormatted + ' ' + ampm;
    }

    // Generar PDF con encabezado, datos del formulario y firma
    document.getElementById('generate-pdf-btn').addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Título principal
        const titleFontSize = 16;
        doc.setFontSize(titleFontSize);
        doc.text('Respaldo De Entrega Realizada', doc.internal.pageSize.width / 2, 20, { align: 'center' });

        // Encabezado de la empresa con la información corregida
        const companyName = "NPL Logística";
        const companyNIT = "Nit: 1035834284-2";
        const companyAddress = "Dirección: Santa Rosa De Osos Antioquia Calle 26C #40-58"; // Dirección corregida
        const companyPhone = "Teléfono: 3226639985";
        
        // Obtener fecha y hora actuales
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString();
        const formattedTime = formatAMPM(currentDate); // Usar formato de 12 horas

        // Centrar el encabezado y reducir el tamaño de las letras
        const headerFontSize = 10; // Tamaño de fuente más pequeño
        const headerTextWidth = doc.getStringUnitWidth(companyName) * headerFontSize / doc.internal.scaleFactor;

        // Agregar encabezado al PDF centrado
        doc.setFontSize(headerFontSize);
        doc.text(companyName, (doc.internal.pageSize.width - headerTextWidth) / 2, 30); // Centrado horizontal
        doc.text(companyNIT, (doc.internal.pageSize.width - headerTextWidth) / 2, 35); // Centrado horizontal
        doc.text(companyAddress, (doc.internal.pageSize.width - headerTextWidth) / 2, 40); // Centrado horizontal
        doc.text(companyPhone, (doc.internal.pageSize.width - headerTextWidth) / 2, 45); // Centrado horizontal

        // Cambiar la etiqueta a "Fecha y Hora de Entrega"
        doc.text(`Fecha y Hora de Entrega: ${formattedDate} ${formattedTime}`, (doc.internal.pageSize.width - headerTextWidth) / 2, 50);

        // Agregar sección "Datos de Destinatario"
        doc.setFontSize(14);
        doc.text('Datos de Destinatario:', 10, 70);

        // Agregar información del formulario al PDF
        const guia = document.getElementById('guia').value;
        const nombre = document.getElementById('nombre').value;
        const cc = document.getElementById('cc').value;
        const documento = document.getElementById('documento').value;

        doc.setFontSize(12);
        doc.text(`Número de Guía: ${guia}`, 10, 80);
        doc.text(`Nombre Completo: ${nombre}`, 10, 90);
        doc.text(`Tipo de Documento: ${cc}`, 10, 100);
        doc.text(`Número de Documento: ${documento}`, 10, 110);

        // Agregar "Firma de Destinatario"
        doc.setFontSize(14);
        doc.text('Firma de Destinatario:', 10, 120);

        // Agregar la firma en el PDF
        const firmaData = firmaCanvas.toDataURL(); // Obtener la firma como imagen
        doc.addImage(firmaData, 'PNG', 10, 130, 180, 60); // Insertar la firma en el PDF

        // Agregar pie de página
        const footerFontSize = 8; // Tamaño de fuente pequeño
        doc.setFontSize(footerFontSize);
        doc.text('SOPORTE NO VALIDO COMO FACTURA DE VENTA', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

        // Mostrar previsualización del PDF
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const iframe = document.getElementById('pdf-preview');
        iframe.src = pdfUrl;
        iframe.style.display = 'block';

        // Hacer visible el botón para la siguiente entrega
        document.getElementById('next-delivery-btn').style.display = 'inline-block';
    });

    // Acción para siguiente entrega
    document.getElementById('next-delivery-btn').addEventListener('click', function () {
        // Mostrar mensaje de "Entrega Exitosa"
        const statusMessage = document.createElement('div');
        statusMessage.textContent = "Entrega Exitosa!";
        statusMessage.style.display = 'block';
        document.body.appendChild(statusMessage);

        // Esperar 3 segundos y reiniciar el formulario
        setTimeout(function () {
            // Limpiar los campos de entrada y la firma
            document.getElementById('guia').value = '';
            document.getElementById('nombre').value = '';
            document.getElementById('documento').value = '';
            ctx.clearRect(0, 0, firmaCanvas.width, firmaCanvas.height);

            // Eliminar el mensaje de "Entrega Exitosa"
            document.body.removeChild(statusMessage);

            // Eliminar la previsualización del PDF
            document.getElementById('pdf-preview').style.display = 'none';

            // Reiniciar el formulario y permitir la nueva entrega
            document.getElementById('next-delivery-btn').style.display = 'none';
        }, 3000); // 3000ms = 3 segundos
    });
});
