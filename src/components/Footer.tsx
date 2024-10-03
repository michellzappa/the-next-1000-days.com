import DarkModeToggle from "./DarkModeToggle";

const Footer = () => {
  return (
    <footer className="mt-auto py-4">
      <div className="container mx-auto flex justify-between items-center">
        <p className="text-sm">Michell Zappa (2024)</p>
        <DarkModeToggle />
      </div>
    </footer>
  );
};

export default Footer;
