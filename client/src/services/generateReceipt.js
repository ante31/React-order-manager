import { PDFDocument, StandardFonts, rgb }from 'pdf-lib';
import { transliterate as tr } from 'transliteration';

const DASHLINE_MARGIN_BOTTOM = 20;
const DASHLINE_MARGIN_TOP = 5;
const NARUDZBA = 22;

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
    return text ? tr(text).replace(/[^\u0000-\u007F]/g, "") : "";
  } catch (e) {
    console.error("Error while normalizing text:", text, e);
    return "";
  }
};


export const generateReceipt = async (order) => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 2000]);

  // Set up fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Set up initial coordinates
  let x = 50;
  let y = 1970;

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

  // Function to add text to the page
  const addText = (text, size, bold = false, align = 'left') => {
      if (!text.includes("€")) {
        text = normalizeText(text); // Apply normalization
      }
      const textWidth = bold ? boldFont.widthOfTextAtSize(text, size) : font.widthOfTextAtSize(text, size);
      let adjustedX = x;

      if (align === 'center') {
          adjustedX = (page.getWidth() - textWidth) / 2;
      } else if (align === 'right') {
          adjustedX = page.getWidth() - textWidth - 50;
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

  // Function to add a dash line
  const addDashLine = () => {
      moveDown(10);
      const dashLine = '-'.repeat(80);
      addText(dashLine, 12, false, 'center');
      moveDown(20);
  };

  // Add restaurant name (centered)
  addText('Fast Food Gricko', 24, true, 'center');
  moveDown(40);

  // Add date and time (flex space between)

  const { date, time } = splitTimestamp(order.time);
  // Add date (left-aligned) and time (right-aligned)
  addText(date, 24, false, 'left');
  addText(time, 24, false, 'right');    

  // Add dash line
  moveDown(DASHLINE_MARGIN_TOP);
  addDashLine();
  moveDown(DASHLINE_MARGIN_BOTTOM);

  // Add order header (centered left)
  addText(order.isDelivery? 'DOSTAVA': "PREUZIMANJE", NARUDZBA, true, 'left');
  moveDown(35);

  // Add cart items (flex space between)
  order.cartItems.forEach(item => {
      const itemName = item.size === "null"
        ? `${item.quantity} x ${item.name.split("|")[0]}`
        : `${item.quantity} x ${item.name.split("|")[0]} (${item.size})`;
      const subtractionValue = item.selectedExtras 
      ? Object.values(item.selectedExtras)
          .map(Number) // Pretvara string brojeve u prave brojeve
          .reduce((a, b) => a + b, 0)
      : 0;
        const itemPrice = `${parseFloat((item.price - subtractionValue)*item.quantity).toFixed(2)} €`;
      addText(itemPrice, 24, false, 'right');
      const itemNameLines = wrapText(itemName, 220, 24, font);
      itemNameLines.forEach((itemNameLine, index) => {
          const text = index === 0 ? itemNameLine : "      " + itemNameLine;
          addText(text, 24, false, 'left');
          if (index !== itemNameLines.length - 1) {
              moveDown(30);
          }
        });

      if (item.selectedExtras)
      {
        moveDown(5);
        Object.entries(item.selectedExtras).map(([extra, value], extraIndex) => {
          moveDown(20);
          addText(`      - ${extra.split('|')[0]}`, 20, false, 'left');
          console.log("VALUE", value, "QUANTITY", item.quantity);
            addText(parseFloat(value*item.quantity).toFixed(2) + " €", 20, false, 'right');
        })
    }
          
      
      // Add dash line between cart items
      moveDown(DASHLINE_MARGIN_TOP);
      addDashLine();
      moveDown(DASHLINE_MARGIN_BOTTOM-5);
  });

  // Add delivery cost (flex space between)
  if (order.isDelivery) {
    addText('Dostava', NARUDZBA, false, 'left');
    addText(`1.50 €`, 24, false, 'right');

    // Add dash line
    addDashLine();
  }

  // Add total price (flex space between)
  moveDown(10);
  addText('Ukupno', NARUDZBA, true, 'left');
  addText(`${parseFloat(order.totalPrice).toFixed(2)} €`, 24, true, 'right');

  // Add dash line
  addDashLine();

  moveDown(10);

  // Add delivery details
  addText(order.isDelivery?'PODACI ZA DOSTAVU:': 'PODACI ZA PREUZIMANJE:', NARUDZBA, false, 'left');
  moveDown(40);

  addText('Narucitelj:', 24, true, 'left');
  moveDown(30);
  const nameLines = wrapText(order.name, 300, 28, font);
  nameLines.forEach((nameLine) => {
      addText(nameLine, 28, false, 'left');
      moveDown(30);
    });

  moveDown(5);

  addText('Broj Mobitela:', 24, true, 'left');
  moveDown(30);
  addText(order.phone, 28, false, 'left');
  moveDown((order.isDelivery || order.note !== "")? 30: 20);

  if (order.isDelivery) {
    addText('Adresa za dostavu:', 24, true, 'left');
    moveDown(30);
    const addressLines = wrapText(`${order.address}, ${order.zone}`, 300, 28, font);
    addressLines.forEach((addressLine, index) => {
      addText(addressLine, 28, false, 'left');
      if (index !== addressLines.length - 1) {
        moveDown(30);
      }
      else{
        if (order.note !== ""){
          moveDown(30);
        }
      }
    });
  }

  if (order.note !== "") {
    addText('Napomena:', 24, true, 'left');
    moveDown(30);
  
    const noteLines = wrapText(order.note, 300, 24, font); // Adjust width as needed
  
    noteLines.forEach((line) => {
      addText(line, 24, false, 'left');
      moveDown(20);
    });
  }

  // Add dash line
  moveDown(DASHLINE_MARGIN_TOP);
  addDashLine();
  moveDown(DASHLINE_MARGIN_BOTTOM-5);

  const { date: deadlineDate, time: deadlineTime } = splitTimestamp(order.deadline);
  console.log(deadlineDate, deadlineTime);
  // Add delivery deadline
  addText(order.isDelivery? 'DOSTAVITI DO:': "NAPRAVITI DO:", NARUDZBA, false, 'left');
  addText(deadlineTime, 28, true, 'right');
  moveDown(DASHLINE_MARGIN_TOP);
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
