import { Button, Card } from "react-bootstrap"
import { formatTimeToEuropean } from "../services/timeToEuropean"
import { generateReceipt } from "../services/generateReceipt"
import { BsCheckLg, BsPrinter } from "react-icons/bs"

export const OrderCard = ({ activeOrders, colors, handleStatusUpdate }) => {
  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', // Creates responsive columns
        gap: '1em', // Adjust space between items
      }}
    >
      {activeOrders.map((order, index) => (
        order.status !== "completed" ? ( 
        <Card
          key={order.id}
          style={{
            outline: `5px solid ${colors[index % colors.length]}`,
            border: 'none',
            borderRadius: '0.5em',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Card.Header
            style={{
              backgroundColor: colors[index % colors.length],
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                color: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '1.2em',
              }}
            >
              {formatTimeToEuropean(order.deadline)}
            </div>
            <div
              style={{
                backgroundColor: 'white',
                color: colors[index % colors.length],
                borderRadius: '50%',
                width: '2em',
                height: '2em',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '1.2em',
              }}
            >
              {index + 1}
            </div>
          </Card.Header>
          {order.status === 'pending' && <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '5px', paddingRight: '5px', paddingLeft: '5px'}}>
            <Button
              style={{
                flex: 2,
                color: 'green', 
                borderColor: 'green', 
                backgroundColor: 'white', 
                borderWidth: '2px', 
                fontWeight: 'bold',
                marginRight: '2px'
              }}
              variant="outline-success"
              onClick={() => handleStatusUpdate(order.id, 'accepted')}
            >
              Prihvati
            </Button>
            <Button
              style={{
                flex: 1,
                color: 'red',
                borderColor: 'red',
                backgroundColor: 'white', 
                borderWidth: '2px',
                fontWeight: 'bold',
                marginLeft: '2px'
              }}
              variant="outline-danger"
              onClick={() => handleStatusUpdate(order.id, 'rejected')}
            >
              Odbij
            </Button>
          </div>}
          <Card.Body>

            <Card.Text>
              Ime: {order.name}
              <br />
              Tip: {order.isDelivery ? 'Dostava' : 'Preuzimanje'}
              <br />
              {order.isDelivery && (
                <>
                  Adresa: {order.address}, {order.zone}
                  <br />
                </>
              )}
              Telefon: {order.phone}
              <br />
              {order.note && <>Napomena: {order.note}<br /></>}
              Vrijeme: {formatTimeToEuropean(order.time)}
              <br />
              </Card.Text>
              <hr />
              {order.cartItems &&
                order.cartItems.map((item) => (
                  <div key={item.id}>
                    <strong>
                      {item.quantity} x {item.name.split("|")[0]}
                      {item.size !== 'null' && (
                        <span style={{ fontWeight: 'lighter' }}> ({item.size})</span>
                      )}
                    </strong>
                    {item.selectedExtras && (
                      <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '1em' }}>
                        {Object.entries(item.selectedExtras).map(([extra, quantity], extraIndex) => (
                          <span key={extraIndex}>
                            {extra.split('|')[0]}
                            {extraIndex < Object.entries(item.selectedExtras).length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
          </Card.Body>
          <Card.Footer 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',  // Center vertically
              backgroundColor: colors[index % colors.length] 
            }}
          >
            <p 
              style={{ 
                backgroundColor: 'white', 
                height: '38px',

                display: 'flex', 
                alignItems: 'center', 
                margin: 0, // Remove default margin for better centering
                padding: '5px 10px', // Add padding for better visibility
                borderRadius: '5px' // Optional: rounded corners
              }}
            >
              {order.totalPrice.toFixed(2)} €
            </p>
            {order.status === 'accepted' ?
            <div>
            {/* Complete Button */}
            {/* Print Button */}
            <Button
              onClick={() => generateReceipt(order)} // Call the generateReceipt function
              style={{
                height: '38px',
                color: 'blue',
                borderColor: 'blue',
                backgroundColor: 'white',
                fontWeight: 'bold'
              }}
            >
              <BsPrinter size={20} /> {/* Use the printer icon */}
            </Button>
            <Button
              onClick={() => handleStatusUpdate(order.id, 'completed')}
              style={{
                height: '38px',
                color: 'green',
                borderColor: 'green',
                backgroundColor: 'white',
                fontWeight: 'bold',
                marginLeft: '10px' // Add some spacing between buttons
              }}
            >
              <BsCheckLg size={20} />
            </Button>
          </div>
            : <></>}
          </Card.Footer>
        </Card>
        ) : null
      ))}
    </div>
  )
}