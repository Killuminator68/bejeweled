import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('NomDeLaBaseDeDonnées.db');

export const insertScore = (utilisateur, score, level) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Scores (utilisateur, score, level) VALUES (?, ?, ?)',
      [utilisateur, score, level],
      (_, { insertId }) => {
        console.log('Score inséré avec l\'ID :', insertId);
        // Affichez tous les scores après l'insertion
        tx.executeSql(
          'SELECT * FROM Scores',
          [],
          (_, result) => {
            console.log('Tous les scores:', result.rows._array);
          }
        );
      },
      (_, error) => {
        console.log('Erreur lors de l\'insertion du score :', error);
      }
    );
  });
};

export const fetchScores = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT DISTINCT utilisateur, score, level FROM Scores ORDER BY score DESC LIMIT 5',
      [],
      (_, result) => {
        const scores = result.rows._array || [];
        console.log('Scores récupérés:', scores);
        callback(scores);
      },
      (_, error) => {
        console.log('Erreur lors de la récupération des scores:', error);
        callback([]);
      }
    );
  });
};

export const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Scores (id INTEGER PRIMARY KEY AUTOINCREMENT, utilisateur TEXT, score INTEGER, level INTEGER);',
      [],
      () => {
        console.log('Table Scores créée avec succès');
      },
      (_, error) => {
        console.log('Erreur lors de la création de la table Scores:', error);
      }
    );
  });
};
