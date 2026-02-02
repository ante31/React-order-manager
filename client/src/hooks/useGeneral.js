import { useEffect, useState } from "react";
import { backendUrl } from "../localhostConf";
import { safeFetch } from "../services/safeFetch";

export function useGeneral() {
  const [general, setGeneral] = useState(null);

  useEffect(() => {
    safeFetch(`${backendUrl}/general`)
      .then((r) => r.json())
      .then(setGeneral);
  }, []);

  const updateGeneral = async (key, value) => {
    const updated = { ...general, [key]: Number(value) };
    setGeneral(updated);

    await safeFetch(`${backendUrl}/general`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: Number(value) }),
    });
  };

  return { general, updateGeneral };
}
