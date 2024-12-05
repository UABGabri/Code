import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./StyleComponents/Elements.module.css";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function ElementsCurs({ idAssignatura, professorId }) {
  const [temes, setTemes] = useState([]);
  const [tests, setTests] = useState({});
  const [newTemaName, setNewTemaName] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [accessKey, setAccessKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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
          setTemes([
            ...temes,
            { id_tema: response.data.id_tema, nom_tema: newTemaName },
          ]);
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

  useEffect(() => {
    temes.forEach((tema) => {
      axios
        .get("http://localhost:8081/recoverTestsTema", {
          params: { id_tema: tema.id_tema },
        })
        .then((response) => {
          if (response.data.status === "Success") {
            setTests((prevTests) => ({
              ...prevTests,
              [tema.id_tema]: response.data.result,
            }));
          }
        })
        .catch((error) => {
          console.error("Error al recuperar els tests:", error);
        });
    });
  }, [temes]);

  const handleTestClick = (test) => {
    setSelectedTest(test);
    setShowModal(true);
  };

  //Seguent pas -> crear a partit del Id del test el layout. Fer demà
  const handleAccessKeySubmit = () => {
    axios
      .post("http://localhost:8081/validateTestAccess", {
        id_test: selectedTest.id_test,
        access_key: accessKey,
      })
      .then((response) => {
        if (response.data.status === "Success") {
          setShowModal(false);
          navigate("/realizarTest", {
            state: { idTest: selectedTest.id_test },
          });
        } else {
          alert("La clau d'accés és incorrecta. Torna-ho a intentar.");
        }
      })
      .catch((error) => {
        console.error("Error validant la clau d'accés:", error);
        alert("Hi ha hagut un error al validar la clau d'accés.");
      });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAccessKey("");
  };

  const handleCreateTest = (id_tema) => {
    navigate("/professorparametres", {
      state: {
        idTema: id_tema,
        id_assignatura: idAssignatura,
        id_professor: professorId,
      },
    });
  };

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
                  <button>Afegir contingut pel {tema.nom_tema}</button>
                </div>
                <div className={styles.tests}>
                  <h3 className={styles.temaSubtitle}>
                    Tests per al tema {tema.nom_tema}
                  </h3>

                  <div className={styles.testList}>
                    {tests[tema.id_tema] && tests[tema.id_tema].length > 0 ? (
                      <ul>
                        {tests[tema.id_tema].map((test) => (
                          <li
                            key={test.id_test}
                            className={styles.testItem}
                            onClick={() => handleTestClick(test)}
                          >
                            {test.nom_test}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No hi ha tests per aquest tema.</p>
                    )}

                    <button
                      className={styles.buttonAddTest}
                      onClick={() => handleCreateTest(tema.id_tema)}
                    >
                      Afegir test
                    </button>
                  </div>
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

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Introdueix la clau accés</h2>
            <input
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className={styles.modalInput}
              placeholder="Clau d'accés"
            />
            <div className={styles.modalActions}>
              <button
                onClick={handleAccessKeySubmit}
                className={styles.modalButton}
              >
                Validar
              </button>
              <button
                onClick={handleCloseModal}
                className={styles.modalButtonCancel}
              >
                Cancel·lar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ElementsCurs;

ElementsCurs.propTypes = {
  professorId: PropTypes.number.isRequired,
  idAssignatura: PropTypes.string.isRequired,
};
