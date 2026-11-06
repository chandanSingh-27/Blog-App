const Loader = ({ text = 'Loading…' }) => (
  <div className="loader-container">
    <div className="spinner" aria-label="Loading" />
    <p>{text}</p>
  </div>
);

export default Loader;
