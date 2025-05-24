const TableHead = () => {
  return (
    <thead>
      <tr>
        <th
          style={{
            width: "5%",
            textAlign: "center",
            color: "white",
            backgroundColor: "red",
            verticalAlign: "middle",
          }}
        ></th>
        <th
          style={{
            width: "5%",
            textAlign: "center",
            color: "white",
            backgroundColor: "red",
            verticalAlign: "middle",
          }}
        >
          Vrijeme Narudžbe
        </th>
        <th
          style={{
            width: "5%",
            textAlign: "center",
            color: "white",
            backgroundColor: "red",
            verticalAlign: "middle",
          }}
        >
          Rok
        </th>
        <th
          style={{
            width: "20%",
            textAlign: "center",
            color: "white",
            backgroundColor: "red",
            verticalAlign: "middle",
          }}
        >
          Ime
        </th>
        <th
          className="d-none d-md-table-cell"
          style={{
            width: "10%",
            textAlign: "center",
            color: "white",
            backgroundColor: "red",
            verticalAlign: "middle",
          }}
        >
          Tip
        </th>
        <th
          className="d-none d-md-table-cell"
          style={{
            width: "30%",
            textAlign: "center",
            color: "white",
            backgroundColor: "red",
            verticalAlign: "middle",
          }}
        >
          Adresa
        </th>
        <th
          className="d-none d-md-table-cell"
          style={{
            width: "15%",
            textAlign: "center",
            color: "white",
            backgroundColor: "red",
            verticalAlign: "middle",
          }}
        >
          Mobitel
        </th>
        <th
          style={{
            width: "10%",
            textAlign: "center",
            color: "white",
            backgroundColor: "red",
            verticalAlign: "middle",
          }}
        >
          Akcije
        </th>
      </tr>
    </thead>
  )
}

export default TableHead