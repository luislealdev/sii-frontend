import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const usePdfExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Función auxiliar para verificar si una hora está en un rango
  const isTimeInRange = (targetTime: string, timeRange: string): boolean => {
    if (!timeRange.includes('-')) return false;
    
    const [start, end] = timeRange.split('-');
    const targetMinutes = timeToMinutes(targetTime);
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    
    return targetMinutes >= startMinutes && targetMinutes < endMinutes;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const exportToPdf = async (elementId: string, fileName: string = 'horario-academico', weekScheduleData?: any) => {
    try {
      setIsExporting(true);
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento no encontrado para exportar');
      }

      // Usar datos pasados directamente o extraer del DOM
      let scheduleData: { [key: string]: any[] } = {};
      
      if (weekScheduleData) {
        // Usar datos pasados directamente desde el componente
        scheduleData = weekScheduleData;
        console.log('Usando datos del contexto:', scheduleData);
      } else {
        // Método de respaldo: extraer del DOM
        console.log('Extrayendo datos del DOM como respaldo');
        scheduleData = {
          lunes: [],
          martes: [],
          miercoles: [],
          jueves: [],
          viernes: [],
          sabado: []
        };
      }

      // Crear una tabla HTML estructurada
      const tempElement = document.createElement('div');
      tempElement.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        background: white;
        width: 800px;
        font-family: Arial, sans-serif;
        color: #000000;
        padding: 20px;
      `;

      // Crear título
      const title = document.createElement('h2');
      title.textContent = 'Horario Académico';
      title.style.cssText = 'text-align: center; color: #057007; margin-bottom: 20px; font-size: 24px;';
      tempElement.appendChild(title);

      // Crear periodo info
      const periodInfo = element.querySelector('[style*="057007"]');
      if (periodInfo && periodInfo.textContent) {
        const periodDiv = document.createElement('div');
        periodDiv.textContent = periodInfo.textContent;
        periodDiv.style.cssText = 'text-align: center; margin-bottom: 20px; font-weight: bold;';
        tempElement.appendChild(periodDiv);
      }

      // Crear tabla del horario
      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 12px;
      `;

      // Crear header de la tabla
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      const days = ['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      days.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        th.style.cssText = `
          background-color: #057007;
          color: white;
          padding: 10px 5px;
          text-align: center;
          border: 1px solid #ccc;
          font-weight: bold;
        `;
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Crear body de la tabla
      const tbody = document.createElement('tbody');
      
      // Obtener todas las filas de horario
      const timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
      
      timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        
        // Columna de hora
        const timeCell = document.createElement('td');
        timeCell.textContent = timeSlot;
        timeCell.style.cssText = `
          background-color: #f8f9fa;
          padding: 8px;
          text-align: center;
          border: 1px solid #ccc;
          font-weight: bold;
        `;
        row.appendChild(timeCell);

        // Columnas para cada día
        const dayNames = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        
        dayNames.forEach((dayKey, dayIndex) => {
          const cell = document.createElement('td');
          cell.style.cssText = `
            padding: 8px 5px;
            text-align: center;
            border: 1px solid #ccc;
            min-height: 40px;
            vertical-align: middle;
          `;

          let hasClass = false;
          
          // Usar datos del contexto de React
          if (scheduleData[dayKey] && Array.isArray(scheduleData[dayKey])) {
            const dayClasses = scheduleData[dayKey];
            
            dayClasses.forEach((clase: any) => {
              if (clase.horario && isTimeInRange(timeSlot, clase.horario)) {
                const materia = clase.materia?.nombre_materia || 'Materia';
                const horario = clase.horario;
                const salon = clase.salon || '';
                
                cell.innerHTML = `
                  <div style="background-color: #e8f5e8; padding: 5px; border-radius: 4px; margin: 2px 0; border-left: 3px solid #057007;">
                    <div style="font-weight: bold; font-size: 10px; margin-bottom: 2px; color: #057007;">${materia}</div>
                    <div style="font-size: 9px; color: #666;">${horario}</div>
                    ${salon ? `<div style="font-size: 9px; color: #666;">📍 ${salon}</div>` : ''}
                  </div>
                `;
                hasClass = true;
              }
            });
          }

          if (!hasClass) {
            cell.textContent = 'Libre';
            cell.style.color = '#999';
            cell.style.fontStyle = 'italic';
          }

          row.appendChild(cell);
        });

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tempElement.appendChild(table);
      
      document.body.appendChild(tempElement);

      // Configurar html2canvas con la copia simplificada
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight
      });

      // Limpiar el elemento temporal
      document.body.removeChild(tempElement);

      // Calcular dimensiones del PDF
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Crear el PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Agregar título
      pdf.setFontSize(20);
      pdf.setTextColor(5, 112, 7);
      pdf.text('Horario Académico', 20, 20);
      
      // Agregar fecha de generación
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      const fecha = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generado el: ${fecha}`, 20, 30);

      // Calcular posición de la imagen
      const startY = 40;
      const availableHeight = 297 - startY - 20;
      
      if (imgHeight > availableHeight) {
        // Dividir en páginas si es necesario
        let position = 0;
        const pageHeight = availableHeight;
        
        while (position < imgHeight) {
          if (position > 0) {
            pdf.addPage();
          }
          
          const canvasSection = document.createElement('canvas');
          const ctx = canvasSection.getContext('2d');
          const sectionHeight = Math.min(pageHeight * canvas.width / imgWidth, canvas.height - position * canvas.width / imgWidth);
          
          canvasSection.width = canvas.width;
          canvasSection.height = sectionHeight;
          
          if (ctx) {
            ctx.drawImage(
              canvas,
              0, position * canvas.width / imgWidth,
              canvas.width, sectionHeight,
              0, 0,
              canvas.width, sectionHeight
            );
          }
          
          const sectionDataUrl = canvasSection.toDataURL('image/png');
          pdf.addImage(sectionDataUrl, 'PNG', 20, position === 0 ? startY : 20, imgWidth - 40, Math.min(pageHeight, sectionHeight * imgWidth / canvas.width));
          
          position += pageHeight;
        }
      } else {
        // Si cabe en una página
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 20, startY, imgWidth - 40, imgHeight);
      }

      // Agregar pie de página
      const totalPages = (pdf.internal as any).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Página ${i} de ${totalPages}`, imgWidth - 40, 285);
      }

      // Descargar el PDF
      pdf.save(`${fileName}.pdf`);
      
      return { success: true, message: 'PDF generado exitosamente' };
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al generar el PDF' 
      };
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPdf,
    isExporting
  };
};