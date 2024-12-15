import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./StyleComponents/Elements.module.css";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Iconos de flecha

function ElementsCurs({ Id_Assignatura, Id_User, Role_User }) {
  const [temes, setTemes] = useState([]);
  const [tests, setTests] = useState({});
  const [newTemaName, setNewTemaName] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [accessKey, setAccessKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [openTema, setOpenTema] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverTemesAssignatura", {
        params: { Id_Assignatura },
      })
      .then((response) => {
        setTemes(response.data);
      })
      .catch((error) => {
        console.error("Error al recuperar els temes:", error);
        alert("Error al recuperar els temes.");
      });
  }, [Id_Assignatura]);

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

  const handleCreateTema = () => {
    if (!newTemaName.trim()) {
      alert("Si us plau, introdueix un nom per al tema");
      return;
    }

    axios
      .post("http://localhost:8081/createTema", {
        Id_Assignatura,
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

  const handleTestClick = (test, tema) => {
    const id_tema = parseInt(tema);
    if (Role_User === "professor") {
      // Si es professor, redirigim a pàgina de personalització
      navigate("/personalitzarTest", {
        state: {
          idTest: test.id_test,
          idTema: id_tema,
        },
      });
    } else {
      // Mostrar modal en cas de no ser professor
      setSelectedTest(test);
      setShowModal(true);
    }
  };

  const handleAccessKeySubmit = () => {
    axios
      .post("http://localhost:8081/validateTestAccess", {
        id_test: selectedTest.id_test,
        access_key: accessKey,
      })
      .then((response) => {
        if (response.data.status === "Success") {
          setShowModal(false);
          navigate("/realitzartest", {
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

  const toggleTema = (id) => {
    setOpenTema((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={styles.elementsCursContainer}>
      <h1 className={styles.elementsCursHeader}>
        <strong>GESTIÓ DE TEMES</strong>
      </h1>
      <div className={styles.temesLista}>
        {temes.length === 0 ? (
          <p className={styles.noTemes}>No hi ha temes creats</p>
        ) : (
          temes.map((tema) => (
            <div key={tema.id_tema} className={styles.temaItem}>
              <div className={styles.temaHeader}>
                <h2 className={styles.temaTitle}>
                  <strong>{tema.nom_tema}</strong>
                </h2>
                <button
                  className={styles.toggleButton}
                  onClick={() => toggleTema(tema.id_tema)}
                >
                  {openTema[tema.id_tema] ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              <hr />
              {openTema[tema.id_tema] && (
                <div className={styles.temaContent}>
                  <div className={styles.contingut}>
                    <h3 className={styles.temaSubtitle}>
                      <strong>Test de Pràctica</strong>
                    </h3>
                    <hr />
                    {Role_User === "professor" && (
                      <button>
                        Afegir Test de Pràctica pel {tema.nom_tema}
                      </button>
                    )}
                  </div>
                  <div className={styles.tests}>
                    <h3 className={styles.temaSubtitle}>
                      <strong>Tests Avaluatius</strong>
                    </h3>
                    <hr />
                    <div className={styles.testList}>
                      {tests[tema.id_tema] && tests[tema.id_tema].length > 0 ? (
                        <ul>
                          {tests[tema.id_tema].map((test) => (
                            <li
                              key={test.id_test}
                              className={styles.testItem}
                              onClick={() =>
                                handleTestClick(test, tema.id_tema)
                              }
                            >
                              {test.nom_test}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No hi ha tests per aquest tema.</p>
                      )}

                      {Role_User === "professor" && (
                        <button
                          className={styles.buttonAddTest}
                          onClick={() => {
                            console.log("ID del tema enviado:", tema.id_tema);
                            navigate("/professorparametres", {
                              state: {
                                idTema: tema.id_tema,
                                id_assignatura: Id_Assignatura,
                                id_professor: Id_User,
                              },
                            });
                          }}
                        >
                          Afegir Test Avaluatiu pel tema {tema.nom_tema}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {Role_User === "professor" && (
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
        )}
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
  Id_User: PropTypes.number.isRequired,
  Id_Assignatura: PropTypes.string.isRequired,
  Role_User: PropTypes.string.isRequired,
};
