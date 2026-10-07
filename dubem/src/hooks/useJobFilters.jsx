import { useSearchParams } from "react-router-dom";
import { jobs } from "../mock/jobs.js";

export default function useJobFilters(type) {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") || "";
  const region = params.get("region") || "";
  const list = (key) => (params.get(key) ? params.get(key).split(",") : []);
  const types = type ? [type] : list("type");
  const modes = list("mode");

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  }

  function toggleInList(key, value) {
    const current = list(key);
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(key, updated.join(","));
  }

  const shown = jobs.filter((j) =>
    (!types.length || types.includes(j.type)) &&
    (!modes.length || modes.includes(j.mode)) &&
    (!region || j.region === region) &&
    (!q || `${j.title} ${j.org}`.toLowerCase().includes(q.toLowerCase()))
  );

  return { q, region, types, modes, shown, setParam, toggleInList, lockedType: !!type };
}