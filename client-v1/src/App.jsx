import useState from "react";
import Table from "./components/Table.jsx";
export function App() {
  const [page, setPage] = useState(0);
  return (
    <div>
      <button>prev</button>
      <button>next</button>
      <Table page={page} />
    </div>
  );
}
