const Footer = () => {
  return (
    <footer className="mt-auto py-4">
      <div className="container mx-auto flex items-left mt-4 text-sm">
        The Next 1.000 Days
      </div>
      <div className="container mx-auto flex items-left mt-4">
        <a href="/chapter-index" className="text-sm mr-2">
          Chapter Index
        </a>
      </div>

      <div className="container mx-auto flex items-left">
        <a href="https://www.envisioning.io" className="text-sm mr-2">
          Envisioning
        </a>
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-8">
          {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
