import React from 'react';
import useFloatingForm from '@/hooks/useFloatingForm';

const FloatingForm: React.FC = () => {
  const { isVisible, position, hideForm } = useFloatingForm();
  if (!isVisible || !position) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 10001,
        background: 'white',
        border: '1px solid #ccc',
        padding: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
      }}>
      <form>
        <label>Selector:</label>
        <input type="text " placeholder="selector" />
        <textarea placeholder="Notas"></textarea>
        <button type="submit">Guardar</button>
        <button type="button" onClick={hideForm}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default FloatingForm;
