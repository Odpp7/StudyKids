const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class FacturaService {
    constructor() {
        this.facturasPath = path.join(app.getPath('documents'), 'StudyKids', 'Facturas');
        this.logoPath = path.join(__dirname, '..', '..', 'assets', 'StudyKidsLogo.png');
        this.crearCarpetaFacturas();
    }

    crearCarpetaFacturas() {
        if (!fs.existsSync(this.facturasPath)) {
            fs.mkdirSync(this.facturasPath, { recursive: true });
        }
    }

    async generarFacturaPago(estudianteId, mes, anio) {
        return new Promise((resolve, reject) => {
            try {
                const db = require('../database/connection');

                const estudiante = db.prepare(`
                    SELECT 
                        e.*,
                        a.nombre AS nombre_acudiente,
                        a.telefono,
                        a.email,
                        a.relacion
                    FROM estudiantes e
                    LEFT JOIN acudientes a 
                        ON a.estudiante_id = e.id
                        AND a.es_principal = 1
                    WHERE e.id = ?
                    `).get(estudianteId);

                if (!estudiante) {
                    throw new Error('Estudiante no encontrado');
                }

                const pagos = db.prepare(`
                    SELECT p.*, pm.total_mensual, pm.total_pagado, pm.estado
                    FROM pagos p
                    INNER JOIN pagos_mensuales pm ON p.estudiante_id = pm.estudiante_id 
                        AND p.mes = pm.mes AND p.anio = pm.anio
                    WHERE p.estudiante_id = ? AND p.mes = ? AND p.anio = ?
                    ORDER BY p.fecha_pago DESC
                `).all(estudianteId, mes, anio);

                if (!pagos || pagos.length === 0) {
                    throw new Error('No hay pagos registrados para este mes');
                }

                // Crear PDF
                const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
                const nombreArchivo = `Factura_${estudiante.nombre.replace(/\s/g, '_')}_${mes}_${anio}.pdf`;
                const rutaCompleta = path.join(this.facturasPath, nombreArchivo);

                const stream = fs.createWriteStream(rutaCompleta);
                doc.pipe(stream);

                const primaryColor = '#2C3E50';
                const accentColor = '#3498DB';
                const successColor = '#27AE60';
                const warningColor = '#F39C12';
                const lightGray = '#ECF0F1';

                // ==================== ENCABEZADO ====================
                doc.rect(0, 0, 612, 100).fill(primaryColor);

                if (fs.existsSync(this.logoPath)) {
                    doc.save();
                    doc.circle(90, 50, 42).fill('#FFFFFF');

                    doc.circle(90, 50, 40).clip();
                    doc.image(this.logoPath, 50, 20, {
                        width: 80,
                        height: 80,
                        fit: [80, 80],
                        align: 'center',
                        valign: 'center'
                    });

                    doc.restore();
                } else {
                    doc.circle(80, 50, 30).fill('#FFFFFF');
                    doc.fontSize(20).fillColor(primaryColor).text('SK', 62, 38);
                }

                doc.fontSize(28).fillColor('#FFFFFF').font('Helvetica-Bold')
                    .text('STUDY KIDS', 150, 35);
                doc.fontSize(11).fillColor(lightGray).font('Helvetica')
                    .text('Centro Educativo de Excelencia', 150, 65);

                function formatearFechaCorrecta(fechaISO) {
                    const [year, month, day] = fechaISO.split('-');
                    return new Date(year, month - 1, day);
                }

                // CORRECCIÓN: Usar pagos[0] en lugar de pago
                const fechaPago = formatearFechaCorrecta(pagos[0].fecha_pago);

                doc.fontSize(9).fillColor('#FFFFFF')
                    .text('Fecha de Pago', 420, 40, { align: 'right', width: 120 })
                    .fontSize(11).font('Helvetica-Bold')
                    .text(fechaPago.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    }), 420, 60, { align: 'right', width: 120 }
                    );

                // ==================== INFORMACIÓN DEL ESTUDIANTE ====================
                let yPos = 140;

                doc.roundedRect(50, yPos, 250, 100, 5).stroke(accentColor);
                doc.rect(50, yPos, 250, 30).fill(accentColor);

                doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold')
                    .text('INFORMACIÓN DEL ESTUDIANTE', 60, yPos + 10);

                yPos += 45;
                doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold')
                    .text('Nombre:', 60, yPos);
                doc.font('Helvetica').fillColor('#34495E')
                    .text(estudiante.nombre, 130, yPos);

                yPos += 20;
                doc.font('Helvetica-Bold').fillColor(primaryColor)
                    .text('Grado:', 60, yPos);
                doc.font('Helvetica').fillColor('#34495E')
                    .text(estudiante.grado, 130, yPos);

                yPos += 20;
                doc.font('Helvetica-Bold').fillColor(primaryColor)
                    .text('Jornada:', 60, yPos);
                doc.font('Helvetica').fillColor('#34495E')
                    .text(estudiante.turno === 'manana' ? 'Mañana' : 'Tarde', 130, yPos);

                // ==================== TABLA DE PAGOS ====================
                yPos = 280;

                // Título de sección
                doc.fontSize(14).fillColor(primaryColor).font('Helvetica-Bold')
                    .text('Detalle de Transacciones', 50, yPos);

                yPos += 30;

                // Encabezados de tabla con fondo
                doc.rect(50, yPos, 510, 25).fill(lightGray);
                doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold')
                    .text('Concepto', 60, yPos + 8)
                    .text('Monto', 480, yPos + 8, { align: 'right', width: 70 });

                yPos += 30;
                let totalPagado = 0;

                // Líneas de pago
                pagos.forEach((pago, index) => {
                    // Fondo alternado
                    if (index % 2 === 0) {
                        doc.rect(50, yPos - 5, 510, 22).fill('#F8F9FA');
                    }

                    doc.fontSize(9).fillColor('#34495E').font('Helvetica')
                        .text(pago.concepto || 'Pago mensualidad', 60, yPos, { width: 400 });

                    doc.font('Helvetica-Bold').fillColor(successColor)
                        .text(`$${pago.monto.toLocaleString()}`, 480, yPos, { align: 'right', width: 70 });

                    totalPagado += pago.monto;
                    yPos += 22;
                });

                // ==================== RESUMEN FINANCIERO ====================
                yPos += 20;

                doc.roundedRect(320, yPos, 240, 120, 5).lineWidth(2).stroke(accentColor);

                yPos += 15;
                const pagoInfo = pagos[0];

                doc.fontSize(10).fillColor('#7F8C8D').font('Helvetica')
                    .text('Mensualidad:', 335, yPos);
                doc.fillColor('#34495E').font('Helvetica-Bold')
                    .text(`$${pagoInfo.total_mensual.toLocaleString()}`, 470, yPos, { align: 'right', width: 80 });

                yPos += 25;
                doc.fillColor('#7F8C8D').font('Helvetica')
                    .text('Total Pagado:', 335, yPos);
                doc.fillColor(successColor).font('Helvetica-Bold')
                    .text(`$${totalPagado.toLocaleString()}`, 470, yPos, { align: 'right', width: 80 });

                yPos += 3;

                yPos += 15;
                // Calcular saldo: si está completado o se pagó de más, saldo = 0
                const saldoCalculado = pagoInfo.total_mensual - pagoInfo.total_pagado;
                const saldo = saldoCalculado > 0 ? saldoCalculado : 0;
                
                doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold')
                    .text('Saldo Pendiente:', 335, yPos);
                doc.fillColor(saldo > 0 ? warningColor : successColor).fontSize(12)
                    .text(`$${saldo.toLocaleString()}`, 470, yPos, { align: 'right', width: 80 });

                // Estado del pago
                yPos += 35;
                let estadoTexto = '';
                let estadoColor = '';

                switch (pagoInfo.estado) {
                    case 'completado':
                        estadoTexto = 'PAGADO';
                        estadoColor = successColor;
                        break;
                    case 'abono':
                        estadoTexto = 'ABONO PARCIAL';
                        estadoColor = warningColor;
                        break;
                    default:
                        estadoTexto = 'PENDIENTE';
                        estadoColor = '#E74C3C';
                }

                doc.roundedRect(335, yPos - 8, 205, 28, 4).fill(estadoColor);
                doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold')
                    .text(estadoTexto, 335, yPos, { align: 'center', width: 205 });

                // ==================== PIE DE PÁGINA ====================
                // Línea decorativa
                doc.moveTo(50, 700).lineTo(560, 700).lineWidth(0.5).stroke(accentColor);

                // Mensaje de agradecimiento
                doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Oblique')
                    .text('¡Gracias por confiar en nosotros para la educación de sus hijos!', 50, 715, {
                        align: 'center',
                        width: 510
                    });

                doc.end();

                stream.on('finish', () => {
                    resolve({
                        success: true,
                        ruta: rutaCompleta,
                        nombreArchivo: nombreArchivo
                    });
                });

                stream.on('error', (error) => {
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new FacturaService();