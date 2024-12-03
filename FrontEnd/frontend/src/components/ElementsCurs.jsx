import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./StyleComponents/Elements.module.css"; // Asegúrate de importar el archivo CSS

function ElementsCurs({ idAssignatura }) {
  const [temes, setTemes] = useState([]);
  const [newTemaName, setNewTemaName] = useState("");

  const handleCreateTema = () => {
    if (!newTemaName.trim()) {
      alert("Si us plau, introdueix un nom per al tema");
      return;
    }

    axios
      .post("http://localhost:8081/createTema", {
        idAssignatura,
        name: newTemaName,
      })
      .then((response) => {
        if (response.data.success) {
          setTemes([...temes, { nom_tema: newTemaName }]);
          setNewTemaName("");
        } else {
          alert("Error en crear el tema");
        }
      })
      .catch((error) => {
        console.error("Error en crear el tema:", error);
        alert("Hi ha hagut un error, torna-ho a intentar.");
      });
  };

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverTemesAssignatura", {
        params: { idAssignatura },
      })
      .then((response) => {
        setTemes(response.data);
      })
      .catch((error) => {
        console.error("Error al recuperar els temes:", error);
        alert("Error al recuperar els temes.");
      });
  }, [idAssignatura]);

  return (
    <div className={styles.elementsCursContainer}>
      <h1 className={styles.elementsCursHeader}>Gestió de Temes</h1>
      <div className={styles.temesLista}>
        {temes.length === 0 ? (
          <p className={styles.noTemes}>No hi ha temes creats</p>
        ) : (
          temes.map((tema, index) => (
            <div key={index} className={styles.temaItem}>
              <h2 className={styles.temaTitle}>{tema.nom_tema}</h2>
              <div className={styles.temaContent}>
                <div className={styles.contingut}>
                  <h3 className={styles.temaSubtitle}>Contingut</h3>
                  <p className={styles.temaDescription}>
                    Contingut per al tema {tema.nom_tema}
                  </p>
                </div>
                <div className={styles.tests}>
                  <h3 className={styles.temaSubtitle}>Tests</h3>
                  <p className={styles.temaDescription}>
                    Tests per al tema {tema.nom_tema}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.temaCrear}>
        <input
          type="text"
          value={newTemaName}
          onChange={(e) => setNewTemaName(e.target.value)}
          placeholder="Nom del tema"
          className={styles.temaInput}
        />
        <button onClick={handleCreateTema} className={styles.temaButton}>
          Afegir Tema
        </button>
      </div>
    </div>
  );
}

export default ElementsCurs;
