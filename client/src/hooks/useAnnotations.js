import { useEffect, useState } from "react";
import { backendUrl } from "../localhostConf";
import { safeFetch } from "../services/safeFetch";

export function useAnnotations() {
  const [annotations, setAnnotations] = useState([]);

  const refetchAnnotations = async () => {
    const res = await safeFetch(`${backendUrl}/annotations`);
    const data = await res.json();
    setAnnotations(data);
  };

  useEffect(() => {
    refetchAnnotations();
  }, []);

  return { annotations, refetchAnnotations };
}