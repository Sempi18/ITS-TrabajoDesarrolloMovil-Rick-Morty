export const logEvent = (action: string, details: any) => {
  const now = new Date();
  
  //  Obtener la hora local
  const time = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // Obtener la fecha local
  const date = now.toLocaleDateString('es-AR');
  
  //  Formatear el timestamp usando la hora y fecha local
  const localTimestamp = `${date} ${time}`;
    
  console.log(`[${localTimestamp}] - ACCIÓN: ${action}`, details);
};