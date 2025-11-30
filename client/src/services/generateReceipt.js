import { PDFDocument, StandardFonts, rgb }from 'pdf-lib';
import { transliterate as tr } from 'transliteration';

const PRORED = 10;
const NARUDZBA = 15;

const safeText = (text) => {
  return text ? text.replace("Č", "C")
                    .replace("Ć", "C")
                    .replace("Š", "S")
                    .replace("Đ", "d")
                    .replace("Ž", "Z")
                    .replace("č", "c")
                    .replace("ć", "c")
                    .replace("š", "s")
                    .replace("đ", "d")
                    .replace("ž", "z")
                    .replace(/[^\u0000-\u007F]/g, "") : ""; // Removes unsupported characters
};

const normalizeText = (text) => {
  try {
    // eslint-disable-next-line no-control-regex
    return text ? tr(text).replace(/[^\u0000-\u007F]/g, "") : "";
  } catch (e) {
    console.error("Error while normalizing text:", text, e);
    return "";
  }
};


export const generateReceipt = async (order) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([220, 2000]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let x = 10;
  let y = 1990;

  const wrapText = (text, maxWidth, fontSize, font) => {
    const words = safeText(text).split(' ');
    let lines = [];
    let currentLine = '';
    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };


  const splitTimestamp = (timestamp) => {
    const [date, time] = timestamp.split("T");
    console.log("DT", date,
    time);
    return { 
        date, 
        time: time.slice(0, 5) // Extract only HH:mm 
    };
  };

  const addText = (text, size, bold = false, align = 'left') => {
      if (!text.includes("€")) {
        text = normalizeText(text); // Apply normalization
      }
      const textWidth = bold ? boldFont.widthOfTextAtSize(text, size) : font.widthOfTextAtSize(text, size);
      let adjustedX = x;

      if (align === 'center') {
          adjustedX = (page.getWidth() - textWidth - 30) / 2;
      } else if (align === 'right') {
          adjustedX = page.getWidth() - textWidth - 10;
      }

      page.drawText(text, {
          x: adjustedX,
          y,
          size,
          font: bold ? boldFont : font,
          color: rgb(0, 0, 0),
      });
  };

  const moveDown = (amount) => {
      y -= amount;
  }

  const addDashLine = () => {
      moveDown(10);
      const dashLine = '-'.repeat(80);
      addText(dashLine, 12, false, 'center');
      moveDown(20);
  };

  const getMealDealTranslation = (item) => {
    if (item === "Posebna ponuda 1" || item === "Meal Deal 1") return " Pizza Ponuda";
    if (item === "Posebna ponuda 2" || item === "Meal Deal 2") return " Hamburger Ponuda";
    if (item === "Posebna ponuda 3" || item === "Meal Deal 3") return " Piletina Ponuda";
    return item;
  };

  // Add restaurant name (centered)
  addText('Fast Food Gricko', 14, true, 'center');
  moveDown(3 * PRORED);

  // Add date and time (flex space between)

  const { date, time } = splitTimestamp(order.time);
  addText(date, 14, false, 'left');
  addText(time, 14, false, 'right');    

  // Add dash line
  addDashLine();

  addText(order.isDelivery? 'DOSTAVA': "PREUZIMANJE", NARUDZBA, true, 'left');
  moveDown(2 * PRORED);

  order.cartItems.forEach(item => {
      const itemName = item.size === "null"
        ? `${item.quantity} x ${getMealDealTranslation(item.name.split("|")[0])}`
        : `${item.quantity} x ${item.name.split("|")[0]} (${item.size})`;
      const subtractionValue = item.selectedExtras 
      ? Object.values(item.selectedExtras)
          .map(Number) 
          .reduce((a, b) => a + b, 0)
      : 0;
        const itemPrice = `${parseFloat((item.price - subtractionValue)*item.quantity).toFixed(2)} €`;
      addText(itemPrice, 14, false, 'right');
      const itemNameLines = wrapText(itemName, 150, 14, font);
      itemNameLines.forEach((itemNameLine, index) => {
          const text = index === 0 ? itemNameLine : "      " + itemNameLine;
          addText(text, 14, false, 'left');
          if (index !== itemNameLines.length - 1) {
              moveDown(14);
          }
        });

      if (item.selectedExtras)
      {
        moveDown(5);
        Object.entries(item.selectedExtras).forEach(([extra, value], extraIndex) => {
          moveDown(12);
          addText(`      - ${extra.split('|')[0]}`, 12, false, 'left');
          console.log("VALUE", value, "QUANTITY", item.quantity);
            addText(parseFloat(value*item.quantity).toFixed(2) + " €", 12, false, 'right');
        })
      }
      if (item.selectedDrinks)
      {
        moveDown(5);
        Object.entries(item.selectedDrinks).forEach(([drink, value], extraIndex) => {
          moveDown(12);
          addText(`      - ${value.ime}`, 12, false, 'left');
        })
    }
          
      addDashLine();
  });

  // Add delivery cost (flex space between)
  if (order.isDelivery) {
    addText('Dostava', NARUDZBA, false, 'left');
    addText(`0.00 €`, 14, false, 'right');

    // Add dash line
    addDashLine();
  }

  // Add total price (flex space between)
  addText('Ukupno', NARUDZBA, true, 'left');
  addText(`${parseFloat(order.totalPrice).toFixed(2)} €`, 14, true, 'right');

  // Add dash line
  addDashLine();

  // Add delivery details
  addText(order.isDelivery?'PODACI ZA DOSTAVU:': 'PODACI ZA PREUZIMANJE:', NARUDZBA-4, false, 'left');
  moveDown(20);

  addText('Narucitelj:', 14, true, 'left');
  moveDown(18);
  const nameLines = wrapText(order.name, 300, 18, font);
  nameLines.forEach((nameLine) => {
      addText(nameLine, 18, false, 'left');
      moveDown(14);
    });

  moveDown(5);

  addText('Broj Mobitela:', 14, true, 'left');
  moveDown(18);
  addText(order.phone, 18, false, 'left');
  moveDown((order.isDelivery || order.note !== "")? 14: 5);

  if (order.isDelivery) {
    addText('Adresa za dostavu:', 14, true, 'left');
    moveDown(18);
    const addressLines = wrapText(`${order.address}, ${order.zone}`, 227, 18, font);
    addressLines.forEach((addressLine, index) => {
      addText(addressLine, 18, false, 'left');
      if (index !== addressLines.length - 1) {
        moveDown(14);
      }
      else{
        if (order.note !== ""){
          moveDown(14);
        }
      }
    });
  }

  if (order.note !== "") {
    addText('Napomena:', 14, true, 'left');
    moveDown(18);
  
    const noteLines = wrapText(order.note, 227, 14, font); // Adjust width as needed
  
    noteLines.forEach((line) => {
      addText(line, 14, false, 'left');
      moveDown(14);
    });
  }

  // Add dash line
  addDashLine();

  const { date: deadlineDate, time: deadlineTime } = splitTimestamp(order.deadline);
  console.log(order);
  // Add delivery deadline
  addText(order.isDelivery? 'DOSTAVITI DO:': "NAPRAVITI DO:", NARUDZBA, false, 'left');
  addText(deadlineTime, 16, true, 'right');
  addDashLine();

  // Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save();

// Create a Blob from the PDF bytes
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

  // window.open(url, '_blank');

// Create an iframe to print the PDF
const iframe = document.createElement('iframe');
iframe.style.position = 'absolute';
iframe.style.width = '0px';
iframe.style.height = '0px';
iframe.style.border = 'none';
iframe.src = url;

document.body.appendChild(iframe);

// Wait for the iframe to load, then trigger the print dialog
iframe.onload = () => {
    iframe.contentWindow.print();
};

};
