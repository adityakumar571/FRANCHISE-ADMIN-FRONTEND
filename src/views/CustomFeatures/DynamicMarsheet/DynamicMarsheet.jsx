import TahaMarsheet from "../Marsheet/TahaMarsheet.js/TahaMarsheet";
import ViewMarks from "../../pages/Marks/ViewMarks";

const DynamicMarsheet = () => {

  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];

  switch(subdomain) {

    case "taha":
      return <TahaMarsheet />;

    default:
      return <ViewMarks />;
  }
};

export default DynamicMarsheet;