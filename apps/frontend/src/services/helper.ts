export const formatOfficeHours = (officeHours): string => {
    return officeHours.map(item => ({
        ...item,
        day: item.day.charAt(0).toUpperCase() + item.day.slice(1),
        mode: item.mode.charAt(0).toUpperCase() + item.mode.slice(1),
        start_time: new Date(`2000-01-01T${item.start_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        end_time: new Date(`2000-01-01T${item.end_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true
        })
      }))
}