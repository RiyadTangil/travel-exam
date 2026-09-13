import jsPDF from "jspdf"

export function generateTicketPDF(ticketData: any) {
  // Create a new PDF document
  const doc = new jsPDF()

  // Format dates for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
    return date.toLocaleDateString("en-US", options)
  }

  // Add company header
  doc.setFontSize(20)
  doc.setTextColor(0, 51, 102) // Dark blue color
  doc.text("Electronic Ticket", 105, 15, { align: "center" })

  // Add a horizontal line
  doc.setDrawColor(0, 51, 102)
  doc.setLineWidth(0.5)
  doc.line(14, 20, 196, 20)

  // Passenger Information Section
  doc.setFontSize(14)
  doc.setTextColor(0, 51, 102)
  doc.text("Passenger Information", 14, 30)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text("Passenger Name:", 14, 40)
  doc.text(ticketData.passengerName || "", 80, 40)

  doc.text("Passport Number:", 14, 47)
  doc.text(ticketData.passportNumber || "", 80, 47)

  doc.text("Ticket Number:", 14, 54)
  doc.text(ticketData.ticketNumber || "", 80, 54)

  // Booking Information Section
  doc.setFontSize(14)
  doc.setTextColor(0, 51, 102)
  doc.text("Booking Information", 14, 70)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text("Booking ID:", 14, 80)
  doc.text(ticketData.bookingId || "", 80, 80)

  doc.text("Airline PNR:", 14, 87)
  doc.text(ticketData.airlinePNR || "", 80, 87)

  doc.text("Reservation No.:", 14, 94)
  doc.text(ticketData.reservationNo || "", 80, 94)

  doc.text("Fare Type:", 14, 101)
  doc.text(ticketData.fareType || "Non-Refundable", 80, 101)

  doc.text("Date of Issue:", 14, 108)
  doc.text(formatDate(ticketData.dateOfIssue) || "", 80, 108)

  // Itinerary Information Section
  doc.setFontSize(14)
  doc.setTextColor(0, 51, 102)
  doc.text("Itinerary Information", 14, 125)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text("Airline:", 14, 135)
  doc.text(ticketData.airline || "", 80, 135)

  doc.text("Flight Number:", 14, 142)
  doc.text(ticketData.flightNumber || "", 80, 142)

  // Format the departure and arrival date/time
  const departureDay = ticketData.departureDate
    ? new Date(ticketData.departureDate).toLocaleDateString("en-US", { weekday: "short" })
    : ""

  const departureDateTime = ticketData.departureDate
    ? `${formatDate(ticketData.departureDate)}, ${departureDay} ${ticketData.departureTime || ""}`
    : ""

  const arrivalDay = ticketData.arrivalDate
    ? new Date(ticketData.arrivalDate).toLocaleDateString("en-US", { weekday: "short" })
    : ""

  const arrivalDateTime = ticketData.arrivalDate
    ? `${formatDate(ticketData.arrivalDate)}, ${arrivalDay} ${ticketData.arrivalTime || ""}`
    : ""

  // Departure Information
  doc.setFontSize(12)
  doc.setTextColor(0, 51, 102)
  doc.text("Departure", 14, 155)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text("Airport:", 14, 165)
  doc.text(ticketData.departureAirport || "", 80, 165)

  doc.text("City/Country:", 14, 172)
  doc.text(`${ticketData.departureCity || ""}, ${ticketData.departureCountry || ""}`, 80, 172)

  doc.text("Terminal:", 14, 179)
  doc.text(ticketData.departureTerminal || "", 80, 179)

  doc.text("Date/Time:", 14, 186)
  doc.text(departureDateTime, 80, 186)

  // Arrival Information
  doc.setFontSize(12)
  doc.setTextColor(0, 51, 102)
  doc.text("Arrival", 14, 200)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text("Airport:", 14, 210)
  doc.text(ticketData.arrivalAirport || "", 80, 210)

  doc.text("City/Country:", 14, 217)
  doc.text(`${ticketData.arrivalCity || ""}, ${ticketData.arrivalCountry || ""}`, 80, 217)

  doc.text("Terminal:", 14, 224)
  doc.text(ticketData.arrivalTerminal || "", 80, 224)

  doc.text("Date/Time:", 14, 231)
  doc.text(arrivalDateTime, 80, 231)

  // Flight Details
  doc.setFontSize(12)
  doc.setTextColor(0, 51, 102)
  doc.text("Flight Details", 14, 245)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text("Baggage Allowance:", 14, 255)
  doc.text(ticketData.baggage || "23 KG", 80, 255)

  doc.text("Travel Class:", 14, 262)
  doc.text(ticketData.travelClass || "Economy", 80, 262)

  doc.text("Duration:", 14, 269)
  doc.text(ticketData.duration || "", 80, 269)

  doc.text("Status:", 14, 276)
  doc.text(ticketData.status || "Confirmed", 80, 276)

  // Add footer
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(
    "This is an electronic ticket. Please bring a printed copy and your identification to the airport.",
    105,
    285,
    { align: "center" },
  )

  // Generate filename based on passenger name and booking ID
  const cleanPassengerName = (ticketData.passengerName || "ticket").replace(/\s+/g, "_")
  const filename = `${cleanPassengerName}_${ticketData.bookingId || "ticket"}.pdf`

  // Save the PDF
  doc.save(filename)

  return true
}
