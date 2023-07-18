import React from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ImageBackground, Animated, Alert, Easing } from "react-native";
import { ProgressBar } from "react-native-paper";
import diamond1 from "../assets/diamond1.png";
import diamond2 from "../assets/diamond2.png";
import diamond3 from "../assets/diamond3.png";
import diamond4 from "../assets/diamond4.png";
import diamond5 from "../assets/diamond5.png";
import diamond6 from "../assets/diamond6.png";
import diamond7 from "../assets/diamond7.png";
import diamond8 from "../assets/diamond8.png";
import level1 from '../assets/level1.jpg';
import level2 from '../assets/level2.jpg';
import level3 from '../assets/level3.jpg';
import level4 from '../assets/level4.jpg';
import level5 from '../assets/level5.jpg';
import level6 from '../assets/level6.jpg';
import level7 from '../assets/level7.jpg';
import level8 from '../assets/level8.jpg';
import game from "../assets/game.jpg";
import { Vibration } from "react-native";
import { insertScore, fetchScores, initializeDatabase } from "../Outils/DataBase.js";
import { Emitter } from "react-native-particles";
import particleImage from "../assets/particles2.png";
import * as Animatable from "react-native-animatable";

const levelImages = [level1,level2,level3,level4,level5,level6,level7,level8];

class GameScreen extends React.Component {
    diamondImages = [diamond1, diamond2, diamond3, diamond4, diamond5, diamond6, diamond7, diamond8];
    levelDuration = 8000; // Durée en millisecondes avant la décrémentation du niveau
    maxProgress = 100; // Valeur maximale de la barre de progression
    initialProgress = 50; // Valeur initiale de la barre de progression

    constructor(props) {
        super(props);
        const { route } = props;
        const { username } = route.params;

        this.state = {
            username,
            levelImage: null,
            grid: this.generateInitialGrid(),
            selectedCell: null,
            score: 0,
            progress: this.initialProgress,
            level: 1,
            paused: false,
            showPauseText: false,
            buttonBorderColor: "yellow",
            borderAnimation: new Animated.Value(0),
            buttonAnimation: new Animated.Value(0),
            animations: [...Array(8)].map(() => [...Array(8)].map(() => new Animated.ValueXY({ x: 0, y: 0 }))),
            cellAnimations: [...Array(8)].map(() => [...Array(8)].map(() => new Animated.Value(1))),
            helpHighlightedCell: null,
            highlightHelpCell: null,
            isHelpActive: false,
            explosions: [],
        };
    }

    componentDidMount() {
        initializeDatabase(); // Initialisation de la base de données

        // Démarrage du minuteur
        this.startTimer();

        // Démarrage de l'animation du bouton
        this.startButtonAnimation();
    }

    componentWillUnmount() {
        // Arrêt du minuteur
        this.stopTimer();
    }

    // Méthode pour sélectionner une image de diamant aléatoire
    selectRandomDiamondImage() {
        // Génération d'un index aléatoire dans la plage des indices du tableau diamondImages
        let randomIndex = Math.floor(Math.random() * this.diamondImages.length);

        // Retourne l'image de diamant correspondant à l'index aléatoire
        return this.diamondImages[randomIndex];
    }

    generateInitialGrid() {
        let initialGrid = [];

        // Boucle pour créer chaque ligne de la grille
        for (let i = 0; i < 8; i++) {
            let row = [];

            // Boucle pour créer chaque cellule dans la ligne
            for (let j = 0; j < 8; j++) {
                let diamondImage;

                // Sélection d'une image de diamant aléatoire jusqu'à ce qu'elle ne viole pas les règles du jeu
                do {
                    diamondImage = this.selectRandomDiamondImage();
                } while (
                    // Vérification de la présence de 3 diamants identiques horizontalement
                    (j >= 2 && row[j - 1] === diamondImage && row[j - 2] === diamondImage) ||
                    // Vérification de la présence de 3 diamants identiques verticalement
                    (i >= 2 && initialGrid[i - 1][j] === diamondImage && initialGrid[i - 2][j] === diamondImage) ||
                    // Vérification de la présence de 3 diamants identiques verticalement avec la ligne précédente
                    (i >= 2 && initialGrid[i - 2][j] === initialGrid[i - 1][j] && initialGrid[i - 1][j] === diamondImage)
                );

                // Ajout de l'image de diamant à la cellule de la ligne
                row.push(diamondImage);
            }

            // Ajout de la ligne à la grille
            initialGrid.push(row);

            // Affichage de la grille après l'ajout d'une nouvelle ligne (pour le débogage)
            console.log("A new row has been added to the grid:", initialGrid);
        }

        // Affichage de la grille initiale générée (pour le débogage)
        console.log("Initial grid generated:", initialGrid);

        // Retourne la grille initiale complète
        return initialGrid;
    }

    handleCellPress(row, column) {
        // Extraction des propriétés de l'état
        const { paused, selectedCell, helpHighlightedCell, cellAnimations } = this.state;

        if (selectedCell) {
            // Reset the scale of the previously selected cell
            Animated.timing(cellAnimations[selectedCell.row][selectedCell.column], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }

        if (helpHighlightedCell) {
            // Annuler la mise en évidence de la cellule d'aide
            this.setState({ helpHighlightedCell: null });
            console.log(`Cell at row: ${row}, column: ${column} pressed. Selected cell is now: ${updatedSelectedCell}`);
            return;
        }

        let updatedSelectedCell;

        if (this.state.selectedCell) {
            // Calcul des différences de position entre les deux cellules
            let [deltaRow, deltaCol] = [Math.abs(selectedCell.row - row), Math.abs(selectedCell.column - column)];

            // Vérification si les cellules sont adjacentes
            if ((deltaRow === 1 && deltaCol === 0) || (deltaRow === 0 && deltaCol === 1)) {
                // Échange des cellules
                this.swapCells(selectedCell.row, selectedCell.column, row, column);

                setTimeout(() => {
                    if (!this.checkForMatch()) {
                        // Si aucun match n'est trouvé, rétablir l'échange initial
                        this.swapCells(selectedCell.row, selectedCell.column, row, column);
                    } else {
                        // S'il y a un match, trouver tous les matches
                        let matches = this.findMatches();
                        if (matches.length > 0) {
                            // Gérer les cellules correspondantes
                            this.handleMatchedCells(matches);
                        }
                    }
                }, 500);
            }

            updatedSelectedCell = null;
        } else {
            updatedSelectedCell = { row, column };
        }

        Vibration.vibrate(50);

        Animated.timing(this.state.cellAnimations[row][column], {
            toValue: 1.2, // modify this to change the zoom level
            duration: 100, // modify this to change the zoom duration
            useNativeDriver: true,
        }).start(() => {
            Animated.timing(this.state.cellAnimations[row][column], {
                toValue: 1,
                duration: 100, // modify this to change the zoom-out duration
                useNativeDriver: true,
            }).start();
        });

        // Mettre à jour la cellule sélectionnée dans l'état
        this.setState({ selectedCell: updatedSelectedCell });
    }

    swapCells(row1, column1, row2, column2) {
        // Extraction de la grille et des animations de l'état
        let { grid, animations } = this.state;

        // Fonction d'interpolation pour l'animation
        let easingFunction = Easing.bounce;

        // Durée de l'animation (en millisecondes)
        let duration = 1000; // Augmentez cette valeur pour un rebond plus fort

        // Animation pour la première cellule
        Animated.timing(animations[row1][column1], {
            toValue: { x: row2 - row1, y: column2 - column1 },
            duration,
            easing: easingFunction,
            useNativeDriver: false,
        }).start();

        // Animation pour la deuxième cellule
        Animated.timing(animations[row2][column2], {
            toValue: { x: row1 - row2, y: column1 - column2 },
            duration,
            easing: easingFunction,
            useNativeDriver: false,
        }).start();

        // Échange des valeurs des cellules dans la grille
        let temp = grid[row1][column1];
        grid[row1][column1] = grid[row2][column2];
        grid[row2][column2] = temp;

        // Mise à jour de la grille dans l'état
        this.setState({ grid });

        // Vérifier s'il y a un match formé par les cellules échangées
        if (this.checkForMatch()) {
            // Gérer les cellules correspondantes
            let matches = this.findMatches();
            if (matches.length > 0) {
                this.handleMatchedCells(matches);
            }
        }

        // Affichage dans la console pour le débogage
        console.log(`Cells at positions (${row1}, ${column1}) and (${row2}, ${column2}) have been swapped. Updated grid: `, grid);

        // Réinitialisation des valeurs d'animation après la durée de l'animation
        setTimeout(() => {
            animations[row1][column1].setValue({ x: 0, y: 0 });
            animations[row2][column2].setValue({ x: 0, y: 0 });
        }, duration);
    }

    createExplosion(x, y) {
        const { grid } = this.state;
        const cellSize = 40; // Taille d'une cellule
        const gridSize = grid.length; // Taille de la grille (nombre de lignes/colonnes)

        const centerX = (gridSize - 1) / 2;
        const centerY = (gridSize - 1) / 2;

        const explosionX = (centerY + y - centerX) * cellSize;
        const explosionY = (centerX + x - centerY) * cellSize;

        setTimeout(() => {
            this.setState((prevState) => ({
                explosions: prevState.explosions.filter((explosion) => explosion.row !== x || explosion.column !== y),
            }));
        }, 2000); // Correspond à la propriété `particleLife` de l'émetteur

        return (
            <View
                style={{
                    position: "absolute",
                    top: explosionY,
                    left: explosionX,
                    transform: [{ translateX: -cellSize / 2 }, { translateY: -cellSize / 2 }],
                    zIndex: 1, // Augmenter le zIndex pour placer l'explosion devant la grille
                }}
            >
                <Emitter numberOfParticles={100} emissionRate={5} interval={200} particleLife={1500} direction={-360} spread={360}>
                    <Image source={particleImage} style={{ width: 50, height: 50 }} />
                </Emitter>
            </View>
        );
    }

   updateLevel() {
    let { score, level, progress, accumulatedScore } = this.state;
    let levelImages = [
        require("../assets/level1.jpg"),
        require("../assets/level2.jpg"),
        require("../assets/level3.jpg"),
        require("../assets/level4.jpg"),
        require("../assets/level5.jpg"),
        require("../assets/level6.jpg"),
        require("../assets/level7.jpg"),
        require("../assets/level8.jpg"),
    ];

    // Define the level thresholds
    let levelThresholds = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

    if (level >= levelThresholds.length) {
        // Stop level progression when max level is reached
        return;
    }

    // Check if the score has reached the threshold for the next level
    if (score >= levelThresholds[level - 1]) {
        // Increment level
        level++;

        // Reset progress
        progress = this.initialProgress;

        // Set the appropriate image for the current level
        let levelImage = levelImages[level - 1];

        // Update level, progress, and levelImage in the state
        this.setState({ level, progress, levelImage });

        // Navigate to the LevelLoading screen with the accumulated score
        this.props.navigation.navigate("LevelLoading", { level, accumulatedScore });
    }
}


    handleMatchedCells(matchedCells) {
        // Extraction de la grille, du score, de la progression, du niveau et du nom d'utilisateur de l'état
        let { grid, score, progress, level, username, accumulatedScore } = this.state;

        // Calcul du nombre de points en fonction du nombre de cellules correspondantes
        let points = 0;
        if (matchedCells.length === 3) {
            points = 100;
        } else if (matchedCells.length === 4) {
            points = 200;
        } else if (matchedCells.length >= 5) {
            points = 300;
        }

        // Parcours des cellules correspondantes
        matchedCells.forEach(({ row, column }) => {
            // Remplacement des cellules correspondantes par une nouvelle image de diamant aléatoire
            grid[row][column] = this.selectRandomDiamondImage();
        });

        // Ajout des points au score
        score += points;
        accumulatedScore += points;

        // Mise à jour du score et du score accumulé dans l'état, puis mise à jour du niveau après la mise à jour du score
        this.setState({ score, grid, accumulatedScore }, () => {
        this.updateLevel();
    });

        // Ajout des explosions
        const explosions = [...this.state.explosions];
        matchedCells.forEach(({ row, column }) => {
            explosions.push({ row, column });
        });
        this.setState({ explosions });

        // Démarrer le minuteur pour arrêter les explosions après une seule explosion
        setTimeout(() => {
            this.setState({ explosions: [] });
        }, 2000);
    }

    handleLevelUp() {
        let { level, progress } = this.state;

        // Définition du score objectif pour passer au niveau suivant
        let scoreGoal = 500 * level;

        if (this.state.score >= scoreGoal) {
            // Incrémentation du niveau
            level++;

            // Réinitialisation de la progression
            progress = this.maxProgress;

            // Mise à jour du niveau et de la progression dans l'état
            this.setState({ level, progress });
            // Arrêt du minuteur
            this.stopTimer();

            // Redémarrage du minuteur
            this.startTimer();

            // Affichage du message de niveau
            this.setState({ showLevelMessage: true });
        }
    }

    handleGameCompletion(username) {
        const { score } = this.state;

        // Insérer le score dans la base de données
        insertScore(username, score);

        // Naviguer vers l'écran de fin de jeu avec le score final et le nom d'utilisateur
        this.props.navigation.navigate("End", { finalScore: score, username: username });
    }

    handlePauseResumeGame = () => {
        if (this.state.paused) {
            // Redémarrer le minuteur et masquer le texte de pause
            this.startTimer();
            this.setState({ showPauseText: false });
        } else {
            // Arrêter le minuteur et afficher le texte de pause
            this.stopTimer();
            this.setState({ showPauseText: true });
        }

        // Inverser l'état de pause dans le state
        this.setState((prevState) => ({ paused: !prevState.paused }));
    };

    handleGameOver = () => {
        const { username } = this.state;

        // Appeler la méthode handleGameCompletion() pour terminer le jeu avec le nom d'utilisateur actuel
        this.handleGameCompletion(username);
    };

    handleRestartGame = () => {
        const { username } = this.state;

        // Arrêter le minuteur
        this.stopTimer();

        // Réinitialisation de l'état du jeu
        this.setState({
            grid: this.generateInitialGrid(),
            selectedCell: null,
            score: 0,
            progress: this.initialProgress,
            level: 1,
            paused: false,
            showPauseText: false,
            buttonBorderColor: "yellow",
            borderAnimation: new Animated.Value(0),
            buttonAnimation: new Animated.Value(0),
            animations: [...Array(8)].map(() => [...Array(8)].map(() => new Animated.ValueXY({ x: 0, y: 0 }))),
            helpHighlightedCell: null,
            highlightHelpCell: null,
            isHelpActive: false,
        });

        // Redémarrer le minuteur
        this.startTimer();
    };

    startTimer() {
        // Démarre le minuteur en utilisant setInterval()
        this.timer = setInterval(() => {
            let { progress, level } = this.state;

            // Décrémente la progression en fonction du niveau
            progress -= level * 3;

            if (progress <= 0) {
                // Si la progression atteint ou dépasse 0, le jeu est terminé
                this.handleGameOver();
            } else if (progress >= this.maxProgress) {
                // Si la progression atteint ou dépasse la valeur maximale, le niveau est augmenté
                this.handleLevelUp();
            }

            // Met à jour la progression dans l'état
            this.setState({ progress });
        }, this.levelDuration);
    }

    stopTimer() {
        // Arrête le minuteur en utilisant clearInterval()
        clearInterval(this.timer);
    }

    animation = new Animated.Value(0); // Initialise la valeur de l'animation

    startAnimation() {
        Animated.timing(this.animation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false, // Utilise le pilote natif si possible
        }).start();
    }

    stopAnimation() {
        this.animation.stopAnimation(); // Stoppe l'animation
    }

    startButtonAnimation() {
        Animated.loop(
            Animated.sequence([
                Animated.timing(this.state.buttonAnimation, {
                    // Utiliser buttonAnimation ici
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: false, // Maintenant, c'est sûr car buttonAnimation n'est pas utilisé ailleurs avec useNativeDriver: true
                }),
                Animated.timing(this.state.buttonAnimation, {
                    // Utiliser buttonAnimation ici
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: false, // Maintenant, c'est sûr car buttonAnimation n'est pas utilisé ailleurs avec useNativeDriver: true
                }),
            ])
        ).start();
    }

    findHintMove = () => {
        const { grid } = this.state;

        console.log("findHintMove called, current grid: ", grid);

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                // Nouvelle logique : simuler chaque mouvement possible
                for (let dRow = -1; dRow <= 1; dRow++) {
                    for (let dCol = -1; dCol <= 1; dCol++) {
                        if ((dRow === 0 && dCol === 0) || Math.abs(dRow) === Math.abs(dCol)) continue; // Ignorer le mouvement sur place et les mouvements diagonaux

                        // Vérifier si le mouvement est valide (à l'intérieur de la grille)
                        if (row + dRow >= 0 && row + dRow < grid.length && col + dCol >= 0 && col + dCol < grid[row].length) {
                            // Copier la grille et effectuer le mouvement simulé
                            const newGrid = [...grid.map((r) => [...r])];
                            [newGrid[row][col], newGrid[row + dRow][col + dCol]] = [newGrid[row + dRow][col + dCol], newGrid[row][col]];

                            // Vérifier si le mouvement simulé conduit à une correspondance
                            if (this.hasMatch(newGrid)) {
                                console.log(`Found hint move at row: ${row}, column: ${col}`);
                                return { row, column: col };
                            }
                        }
                    }
                }

                // Vérification horizontale
                if (col < grid[row].length - 2) {
                    // Vérifie s'il y a une correspondance avec deux cellules identiques adjacentes l'une à l'autre
                    if (grid[row][col] === grid[row][col + 1]) {
                        // Vérifie s'il y a une troisième cellule soit deux à droite, soit deux à gauche
                        if ((col > 1 && grid[row][col - 2] === grid[row][col]) || (col < grid[row].length - 3 && grid[row][col + 3] === grid[row][col])) {
                            console.log(`Found hint move at row: ${row}, column: ${col}`);
                            return { row, column: col };
                        }
                    }

                    // Vérifie s'il y a une correspondance avec deux cellules identiques avec une cellule entre les deux
                    if (grid[row][col] === grid[row][col + 2]) {
                        // La cellule du milieu peut être déplacée
                        console.log(`Found hint move at row: ${row}, column: ${col + 1}`);
                        return { row, column: col + 1 };
                    }
                }

                // Vérification verticale
                if (row < grid.length - 2) {
                    // Vérifie s'il y a une correspondance avec deux cellules identiques adjacentes l'une à l'autre
                    if (grid[row][col] === grid[row + 1][col]) {
                        // Vérifie s'il y a une troisième cellule soit deux au-dessus, soit deux en-dessous
                        if ((row > 1 && grid[row - 2][col] === grid[row][col]) || (row < grid.length - 3 && grid[row + 3][col] === grid[row][col])) {
                            console.log(`Found hint move at row: ${row}, column: ${col}`);
                            return { row, column: col };
                        }
                    }

                    // Vérifie s'il y a une correspondance avec deux cellules identiques avec une cellule entre les deux
                    if (grid[row][col] === grid[row + 2][col]) {
                        // La cellule du milieu peut être déplacée
                        console.log(`Found hint move at row: ${row + 1}, column: ${col}`);
                        return { row: row + 1, column: col };
                    }
                }

                // Vérification en diagonale pour la forme "T"
                if (col < grid[row].length - 1 && row < grid.length - 2) {
                    // Vérifie s'il y a une correspondance avec deux cellules identiques adjacentes l'une à l'autre
                    if (grid[row][col] === grid[row + 1][col] && grid[row][col] === grid[row + 2][col + 1]) {
                        console.log(`Found hint move at row: ${row}, column: ${col}`);
                        return { row, column: col };
                    }

                    if (grid[row][col] === grid[row + 1][col] && grid[row][col] === grid[row + 2][col - 1]) {
                        console.log(`Found hint move at row: ${row}, column: ${col}`);
                        return { row, column: col };
                    }
                }

                // Vérification en forme de "U"
                if (col < grid[row].length - 2 && row < grid.length - 1) {
                    // Vérifie s'il y a une correspondance avec trois cellules identiques formant un "U"
                    if (grid[row][col] === grid[row + 1][col] && grid[row][col] === grid[row][col + 2] && grid[row][col] === grid[row + 1][col + 2]) {
                        console.log(`Found hint move at row: ${row + 1}, column: ${col + 1}`);
                        return { row: row + 1, column: col + 1 };
                    }
                }

                // Vérification en diagonale pour la forme "L"
                if (col < grid[row].length - 1 && row < grid.length - 1) {
                    // Vérifie s'il y a une correspondance avec deux cellules identiques adjacentes l'une à l'autre
                    if (grid[row][col] === grid[row + 1][col] && grid[row][col] === grid[row][col + 1]) {
                        // Vérifie s'il y a une troisième cellule en diagonale
                        if (
                            (col < grid[row].length - 2 && row < grid.length - 2 && grid[row + 2][col + 1] === grid[row][col]) ||
                            (col < grid[row].length - 2 && row > 0 && grid[row - 1][col + 1] === grid[row][col]) ||
                            (col > 0 && row < grid.length - 2 && grid[row + 2][col - 1] === grid[row][col]) ||
                            (col > 0 && row > 0 && grid[row - 1][col - 1] === grid[row][col])
                        ) {
                            console.log(`Found hint move at row: ${row}, column: ${col}`);
                            return { row, column: col };
                        }
                    }
                }
            }
        }

        let grid3 = [
            /* une grille avec un mouvement d'aide possible */
        ];
        console.log(findHintMove(grid3)); // devrait afficher le mouvement d'aide

        let grid4 = [
            /* une grille sans mouvement d'aide possible */
        ];
        console.log(findHintMove(grid4)); // devrait afficher null

        // Aucun mouvement d'aide trouvé
        console.log("No hint move found");
        return null;
    };

    hasMatch = (grid) => {
        let matchFound = false;
        this.checkGrid(grid, () => (matchFound = true));
        return matchFound;
    };

    checkGrid = (grid, callback) => {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 6; j++) {
                const horizontalMatch = grid[i][j] === grid[i][j + 1] && grid[i][j] === grid[i][j + 2];
                const verticalMatch = grid[j][i] === grid[j + 1][i] && grid[j][i] === grid[j + 2][i];

                if (horizontalMatch || verticalMatch) {
                    callback(i, j, horizontalMatch, verticalMatch);
                }
            }
        }
    };

    checkForMatch = () => {
        let matchFound = false;
        this.checkGrid(this.state.grid, () => (matchFound = true));
        return matchFound;
    };

    findMatches = () => {
        let matches = [];
        this.checkGrid(this.state.grid, (i, j, horizontalMatch, verticalMatch) => {
            if (horizontalMatch) {
                matches.push({ row: i, column: j }, { row: i, column: j + 1 }, { row: i, column: j + 2 });
            }
            if (verticalMatch) {
                matches.push({ row: j, column: i }, { row: j + 1, column: i }, { row: j + 2, column: i });
            }
        });

        console.log("Matches found:", matches);
        return matches;
    };

    highlightHelpCell = () => {
        if (this.state.isHelpActive) {
            // Si l'aide est déjà active, désactivez-la et réinitialisez highlightHelpCell
            this.setState({
                isHelpActive: false,
                highlightHelpCell: null,
            });
            console.log("Help deactivated"); // Affiche un message dans la console pour indiquer que l'aide a été désactivée
            return;
        }

        console.log("highlightHelpCell called"); // Affiche un message dans la console pour indiquer que highlightHelpCell a été appelée

        const hintMove = this.findHintMove(); // Appelle la fonction findHintMove pour trouver un mouvement d'aide
        console.log("Received hint move from findHintMove: ", hintMove); // Affiche le mouvement d'aide reçu dans la console

        if (hintMove) {
            // Si un mouvement d'aide est trouvé
            console.log("Setting state with received hint move"); // Affiche un message dans la console pour indiquer que l'état est mis à jour avec le mouvement d'aide trouvé
            this.setState(
                {
                    highlightHelpCell: hintMove, // Définit highlightHelpCell sur le mouvement d'aide trouvé
                    isHelpActive: true, // Définit isHelpActive sur true pour indiquer que l'aide est active
                },
                () => {
                    console.log("State updated, highlightHelpCell: ", this.state.highlightHelpCell); // Affiche l'état mis à jour de highlightHelpCell dans la console
                }
            );
        } else {
            // Si aucun mouvement d'aide n'est trouvé
            console.log("No hint move found, showing alert"); // Affiche un message dans la console pour indiquer qu'aucun mouvement d'aide n'a été trouvé
            // Vous pouvez personnaliser cette partie en affichant une notification à l'utilisateur pour informer qu'aucun mouvement d'aide n'a été trouvé
            Alert.alert("Aide", "Désolé, aucun mouvement aidant à aligner trois diamants n'a été trouvé.", [{ text: "OK" }], { cancelable: false });
        }
    };

    // Méthode pour obtenir la couleur de la barre de progression en fonction de la valeur de progress
    getProgressBarColor() {
        const { progress } = this.state;
        if (progress <= 15) {
            return "#ff0000"; // Rouge si le niveau de progression est inférieur ou égal à 15
        } else if (progress <= 30) {
            return "#ffa500"; // Orange si le niveau de progression est compris entre 15 et 30
        } else {
            return "#00ff00"; // Vert si le niveau de progression est supérieur à 30
        }
    }

    // Méthode pour obtenir le message correspondant à la valeur de progress
    getProgressMessage() {
        const { progress } = this.state;
        if (progress <= 15) {
            return "Vite on se dépêche !"; // Message lorsque le niveau de progression est inférieur ou égal à 15
        } else if (progress <= 30) {
            return "Allez on se concentre !"; // Message lorsque le niveau de progression est compris entre 15 et 30
        } else {
            return "Bonne chance !"; // Message lorsque le niveau de progression est supérieur à 30
        }
    }

    renderRow = ({ item: row, index: rowIndex }) => {
        const { paused, highlightHelpCell } = this.state;

        // Rendu de chaque ligne
        return (
            <View style={styles.row}>
                {row.map((cell, column) => {
                    let translate = this.state.animations[rowIndex][column].getTranslateTransform();

                    // Vérification si la cellule est sélectionnée
                    const isSelectedCell = this.state.selectedCell?.row === rowIndex && this.state.selectedCell?.column === column;

                    // Vérification si la cellule est une cellule d'aide mise en évidence
                    const ishighlightHelpCell = highlightHelpCell?.row === rowIndex && highlightHelpCell?.column === column;

                    // Couleur et largeur de la bordure de la cellule
                    const borderColor = isSelectedCell ? "yellow" : "transparent";
                    const borderWidth = isSelectedCell ? 2 : 0;

                    // Animation de clignotement pour la cellule d'aide
                    const blinkValue = new Animated.Value(1);
                    if (ishighlightHelpCell) {
                        Animated.loop(Animated.sequence([Animated.timing(blinkValue, { toValue: 0.2, duration: 500, useNativeDriver: false }), Animated.timing(blinkValue, { toValue: 1, duration: 500, useNativeDriver: false })])).start();
                    }

                    // Rendu de chaque cellule
                    return (
                        <TouchableOpacity key={column} onPress={() => this.handleCellPress(rowIndex, column)}>
                            <Animatable.View
                                ref={(ref) => (this[`animationRef_${rowIndex}_${column}`] = ref)}
                                style={[
                                    styles.cell,
                                    {
                                        borderColor,
                                        borderWidth,
                                        transform: translate,
                                        opacity: ishighlightHelpCell ? blinkValue : paused && !isSelectedCell ? 0.0 : 1,
                                        backgroundColor: ishighlightHelpCell ? "lightgreen" : "#eee",
                                    },
                                ]}
                            >
                                <Image source={cell} style={styles.image} />
                            </Animatable.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    render() {
        const { grid, score, progress, level, username, paused, showPauseText, buttonBorderColor } = this.state;
        const pauseButtonText = paused ? "Reprendre" : "Pause";
        const progressBarColor = this.getProgressBarColor();
        const progressMessage = this.getProgressMessage();
        const levelImages = [
            require("../assets/level1.jpg"),
            require("../assets/level2.jpg"),
            require("../assets/level3.jpg"),
            require("../assets/level4.jpg"),
            require("../assets/level5.jpg"),
            require("../assets/level6.jpg"),
            require("../assets/level7.jpg"),
            require("../assets/level8.jpg"),
        ];

        const gridComponent = (
            <View style={[styles.grid, paused ? { opacity: 0 } : {}]}>
                {grid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((cell, colIndex) => (
                            <TouchableOpacity key={colIndex} onPress={() => this.handleCellPress(rowIndex, colIndex)} activeOpacity={1}>
                                <Animated.View style={[styles.cell, { transform: [{ scale: this.state.cellAnimations[rowIndex][colIndex] }] }]}>
                                    <Image source={cell} style={styles.image} />
                                </Animated.View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        );

        const explosionsComponent = (
            <View style={[styles.grid, { position: "absolute" }]}>
                {this.state.explosions.map((explosion, index) => (
                    <View key={index} style={{ position: "relative", top: explosion.row * -100, left: explosion.column * -100 }}>
                        <Emitter numberOfParticles={500} emissionRate={5} interval={500} particleLife={500} direction={50} spread={0}>
                            <Image source={particleImage} style={{ width: 100, height: 100 }} />
                        </Emitter>
                    </View>
                ))}
            </View>
        );

        const pauseTextComponent = (
            <Animatable.Text style={{ fontSize: 100, color: "yellow", textShadowColor: "black", textShadowRadius: 10 }} animation="flash" iterationCount="infinite">
                Pause
            </Animatable.Text>
        );

        return (
            <ImageBackground source={levelImages[this.state.level - 1]} style={styles.backgroundImage} resizeMode="cover">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={[styles.username, { color: "yellow" }]}>{username}</Text>
                        <Text style={styles.scoreText}>{progressMessage}</Text>
                        <Text style={styles.scoreText}>Score: {score}</Text>
                        <Text style={styles.scoreText}>Niveau: {level}</Text>
                    </View>

                    <View style={styles.gridContainer}>
                        {gridComponent}
                        {explosionsComponent}
                    </View>

                    {showPauseText ? pauseTextComponent : null}

                    <View style={styles.progressContainer}>
                        <ProgressBar progress={progress / this.maxProgress} color={progressBarColor} style={styles.progress} />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => this.handleGameCompletion(username)} style={[styles.scoreButton, { borderColor: buttonBorderColor, backgroundColor: "#841584" }]}>
                            <Text style={[styles.buttonText, { color: "#ffffff" }]}>Fin de partie</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.handlePauseResumeGame} style={[styles.scoreButton, { borderColor: buttonBorderColor, backgroundColor: "#841584" }]}>
                            <Text style={[styles.buttonText, { color: "#ffffff" }]}>{pauseButtonText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.highlightHelpCell} style={[styles.scoreButton, { borderColor: buttonBorderColor, backgroundColor: "#841584" }]}>
                            <Text style={[styles.buttonText, { color: "#ffffff" }]}>Aide</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.handleRestartGame} style={[styles.scoreButton, { borderColor: buttonBorderColor, backgroundColor: "#841584" }]}>
                            <Text style={[styles.buttonText, { color: "#ffffff" }]}>Restart</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 20,
        paddingBottom: 20,
    },
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 35,
    },
    header: {
        alignItems: "center",
    },
    username: {
        fontSize: 20,
    },
    scoreText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "yellow",
        marginTop: 10,
    },
    progressContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    progress: {
        width: 200,
        height: 20,
        marginBottom: 50,
    },
    explosionsContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 2,
    },
    gridContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
    },
    grid: {
        alignSelf: "center",
        zIndex: 1,
    },
    row: {
        flexDirection: "row",
    },
    cell: {
        width: 40,
        height: 40,
        backgroundColor: "#eee",
        margin: 2,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 2, // Set border width
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    image: {
        width: 35,
        height: 35, //
        borderRadius: 7,
    },
    buttonContainer: {
        flexDirection: "row",
    },
    scoreButton: {
        borderWidth: 2,
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 5,
    },
    buttonText: {
        fontSize: 15,
    },
    levelMessageContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    levelMessage: {
        padding: 20,
        backgroundColor: "rgba(255, 255, 0, 0.5)",
        borderRadius: 10,
        alignItems: "center",
    },
    levelText: {
        fontSize: 18,
        marginBottom: 10,
    },
    nextLevelText: {
        fontSize: 16,
        color: "#666",
    },
});

export default GameScreen;
