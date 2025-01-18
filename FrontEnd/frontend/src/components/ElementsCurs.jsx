import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./StyleComponents/Elements.module.css";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";

function ElementsCurs({ Id_Assignatura, Id_User, Role_User }) {
  const [temes, setTemes] = useState([]);
  const [testsAvaluatius, setTestsAvaluatius] = useState({});
  const [testsPractica, setTestsPractica] = useState({});
  const [newTemaName, setNewTemaName] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [accessKey, setAccessKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [openTema, setOpenTema] = useState({});
  const navigate = useNavigate();

  //Funció que permet deixar oberts els temes.
  useEffect(() => {
    const storedOpenTema = JSON.parse(localStorage.getItem("openTema"));
    if (storedOpenTema) {
      setOpenTema(storedOpenTema);
    }
  }, []);

  //Funció de recuperació dels temes de la assignatura.
  useEffect(() => {
    axios
      .get("http://localhost:8081/recoverTopicsSubject", {
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

  //Funció de recuperació de tots els tests de cada tema.
  useEffect(() => {
    temes.forEach((tema) => {
      axios
        .get("http://localhost:8081/recoverTestsTema", {
          params: { id_tema: tema.id_tema },
        })
        .then((response) => {
          if (response.data.status === "Success") {
            const testsAvaluatius = response.data.result.filter(
              (test) => test.tipus === "avaluatiu"
            );

            setTestsAvaluatius((prevTests) => ({
              ...prevTests,
              [tema.id_tema]: testsAvaluatius,
            }));

            const testsPractica = response.data.result.filter(
              (test) => test.tipus === "practica"
            );

            setTestsPractica((prevTests) => ({
              ...prevTests,
              [tema.id_tema]: testsPractica,
            }));
          }
        })
        .catch((error) => {
          console.error("Error al recuperar els tests:", error);
        });
    });
  }, [temes]);

  //Funció de creació d'un tema.
  const handleCreateTema = () => {
    if (!newTemaName.trim()) {
      alert("Si us plau, introdueix un nom per al tema");
      return;
    }

    axios
      .post("http://localhost:8081/createTopic", {
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
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error en crear el tema:", error);
        alert("Hi ha hagut un error, torna-ho a intentar.");
      });
  };

  //Funció d'accés a un test en concret.
  const handleTestClick = (test, tema) => {
    const id_tema = parseInt(tema);

    // Verifica que test no sigui null
    if (!test || !test.id_test) {
      console.error("Test no vàlid o falta 'id_test'");
      return;
    }

    if (Role_User === "professor") {
      // Si és professor, redirigim a la pàgina de personalització

      const id = parseInt(Id_Assignatura);
      navigate("/personalitzarTest", {
        state: {
          idTest: test.id_test,
          idTema: id_tema,
          idAssignatura: id,
        },
      });
    } else {
      // Mostrar modal en cas de no ser professor.
      if (test.tipus === "avaluatiu") {
        setSelectedTest(test);
        setShowModal(true);
      } else {
        setSelectedTest(test);

        if (selectedTest && selectedTest.id_test) {
          navigate("/realitzartest", {
            state: { idTest: selectedTest.id_test, Id_User },
          });
        } else {
          console.error("El test seleccionat és invàlid o manca 'id_test'");
        }
      }
    }
  };

  //Funció d'eliminació d'un tema.
  const handleDeleteTheme = (id_tema) => {
    axios
      .delete("http://localhost:8081/deleteTheme", { data: { id_tema } })
      .then((response) => {
        alert("Tema eliminat amb èxit!");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error eliminant el tema", error);
        alert("Hi ha hagut un error al eliminar el tema.");
      });
  };

  //Funció de validació de la clau d'accés
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
            state: { idTest: selectedTest.id_test, Id_User },
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
    setOpenTema((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className={styles.elementsCursContainer}>
      <h1 className={styles.elementsCursHeader}>
        <strong>GESTIÓ DE TEMES</strong>
      </h1>
      <div className={styles.temesList}>
        {temes.length === 0 ? (
          <p className={styles.noTemes}>No s'han creat temes</p>
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
                  <div className={styles.tests}>
                    <h3 className={styles.temaSubtitle}>
                      <strong>Proves Pràctiques</strong>
                    </h3>
                    <hr />
                    <div className={styles.testList}>
                      {testsPractica[tema.id_tema] &&
                      testsPractica[tema.id_tema].length > 0 ? (
                        <ol>
                          {testsPractica[tema.id_tema].map((test) => (
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
                        </ol>
                      ) : (
                        <p>
                          No hi ha proves pràctiques disponibles per aquest
                          tema.
                        </p>
                      )}

                      {Role_User === "professor" && (
                        <button
                          className={styles.buttonAddTest}
                          onClick={() => {
                            //console.log(tema.id_tema);
                            navigate("/createQuizz", {
                              state: {
                                id_assignatura: Id_Assignatura,
                                id_professor: Id_User,
                                id_tema: tema.id_tema,
                                tipus: "practica",
                              },
                            });
                          }}
                        >
                          <FaPlus />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.tests}>
                    <h3 className={styles.temaSubtitle}>
                      <strong>Proves Avaluatives</strong>
                    </h3>
                    <hr />
                    <div className={styles.testList}>
                      {testsAvaluatius[tema.id_tema] &&
                      testsAvaluatius[tema.id_tema].length > 0 ? (
                        <ol>
                          {testsAvaluatius[tema.id_tema].map((test) => (
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
                        </ol>
                      ) : (
                        <p>
                          No hi ha proves avaluatives disponibles per aquest
                          tema.
                        </p>
                      )}

                      {Role_User === "professor" && (
                        <button
                          className={styles.buttonAddTest}
                          onClick={() => {
                            navigate("/createQuizz", {
                              state: {
                                id_assignatura: Id_Assignatura,
                                id_professor: Id_User,
                                id_tema: tema.id_tema,
                                tipus: "avaluatiu",
                              },
                            });
                          }}
                        >
                          <FaPlus />
                        </button>
                      )}
                    </div>
                  </div>

                  {Role_User === "professor" && (
                    <button
                      className={styles.deleteTheme}
                      onClick={() => handleDeleteTheme(tema.id_tema)}
                    >
                      Eliminar Tema
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {Role_User === "professor" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateTema();
            }}
            className={styles.temaCrear}
          >
            <input
              type="text"
              value={newTemaName}
              onChange={(e) => setNewTemaName(e.target.value)}
              placeholder="Nom del tema"
              className={styles.temaInput}
              required
              maxLength={12}
              pattern="^[A-Za-zÀ-ÿ0-9\s]+$"
              title="El nom del tema ha de contenir elements vàlids."
            />
            <button type="submit" className={styles.temaButton}>
              Afegir Tema
            </button>
          </form>
        )}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Introdueix la Clau d'Accés</h2>
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
