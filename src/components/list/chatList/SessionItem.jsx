import { useState, useRef, useEffect } from "react";

const SessionItem = ({ session, onSelect }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="item" onClick={() => onSelect(session)}>
      <img src="./arquivo.png" alt="" />

      <div className="texts">
        <span>{session.fileName}</span>
        <p>{session.lastMessage}</p>
      </div>

      {/* CONFIGURAÇÕES */}
      <div
        className="config-wrapper"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()} 
      >
        <i
          className="fa fa-ellipsis-v config-icon"
          onClick={() => setOpen((prev) => !prev)}
        />

        {open && (
          <div className="config-menu">
            <button>Renomear</button>
            <button>Configurações</button>
            <button className="danger">Excluir</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionItem;
