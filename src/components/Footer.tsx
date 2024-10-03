import DarkModeToggle from "./DarkModeToggle";

const Footer = () => {
  return (
    <footer className="mt-auto py-4">
      <div className="container mx-auto flex justify-between items-center">
        <p className="text-sm">Envisioning (2024)</p>
        <DarkModeToggle />
      </div>
    </footer>
  );
};

export default Footer;
