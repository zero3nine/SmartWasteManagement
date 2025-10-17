function Button({ children, type = "button" }) {
  return (
    <button type={type} className="btn">
      {children}
    </button>
  );
}

export default Button;
