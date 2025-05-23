import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore"; // Firestore methods
import "./MultiplayerPage.css";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { MessageCircle, Send, User } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MultiplayerPage = () => {
  const largeSampleText = `The quick brown fox jumps over the lazy dog.This sentence contains all the letters in the English alphabet.
Programming is the process of creating a set of instructions that tell a computer how to perform a task.
React is a JavaScript library for building user interfaces.It is maintained by Facebook and a community of individual developers and companies.
TypeScript is a strongly typed programming language that builds on JavaScript giving you better tooling at any scale.
The best way to learn to code is by actually coding.Practice makes perfect when it comes to programming.
Algorithms are stepbystep procedures for calculations.Data structures are ways to organize and store data.
Clean code is code that is easy to understand and easy to change.Always write code as if the person who ends up maintaining it is a violent psychopath who knows where you live.
The only way to go fast is to go well.Quality is never an accident it is always the result of intelligent effort.
JavaScript is the worlds most popular programming language.It is the programming language of the Web.
Computer science is no more about computers than astronomy is about telescopes.Its about solving problems.
The most disastrous thing that you can ever learn is your first programming language.The second one always seems easier.
Debugging is twice as hard as writing the code in the first place.Therefore if you write the code as cleverly as possible you are by definition not smart enough to debug it.
There are two ways of constructing a software design. One way is to make it so simple that there are obviously no deficiencies and the other way is to make it so complicated that there are no obvious deficiencies.
Measuring programming progress by lines of code is like measuring aircraft building progress by weight.
The most important property of a program is whether it accomplishes the intention of its user.
Any fool can write code that a computer can understand.Good programmers write code that humans can understand.
First solve the problem.Then write the code.Programming isnt about what you know its about what you can figure out.
Sometimes it pays to stay in bed on Monday rather than spending the rest of the week debugging Mondays code.
The best thing about a boolean is even if you are wrong you are only off by a bit.
If debugging is the process of removing software bugs then programming must be the process of putting them in.
Its not a bug  its an undocumented feature.The computer was born to solve problems that did not exist before.
On January 1st 2024 at exactly 064500 AM a new user named meghasingh07 registered on the system using the email meghasingh07gmailcom and set her password to SecurePass1234.
Her contact number was entered as 919876512345 and her backup contact was listed as 919988877665.
Her full address read C204 Second Floor Galaxy Apartments Sector22 Noida UP 201301.
She provided her PAN number as BNZPS1234K and her Aadhaar number as 234567891011.
The system assigned her a unique Customer ID CUS0001273IN and logged the signup request in the backend log file userreg20240101log.
The registration form had 8 fields name email password phone backup phone address PAN and Aadhaar.
All were validated using regex patterns like alphanumeric for email and alphanumeric for PAN.
After validation a welcome email was triggered via SMTP at 064533 AM with the subject line Welcome to SafeStore Megha and fromaddress supportsafestorein.
At 070012 AM Megha logged in for the first time.The login API apiviauthlogin was hit with headers like ContentType applicationjson and the payload email meghasingh07gmailcom password SecurePass1234.
On successful login the system generated a JWT token starting with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and set the token as an HttpOnly cookie with expiry 20240201T070012Z. Her session ID was logged as SID8845129072.
By 081259 AM Megha had browsed 14 different products.Product IDs included PROD2024001 PROD2024002 all the way to PROD2024014.
She added 3 items to her cart a Logitech MX Master 3S priced at 749900 an HP M24f Monitor priced at 1179950 and a boAt Rockerz 255 Pro priced at 199900.
The cart total was 2129750 plus a GST of 383355 totaling 2513105.
At checkout her billing address was autofilled using the previously stored info and the payment mode chosen was Credit Card Visa ending in 1234.`;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [lobbyId, setLobbyId] = useState("");
  const [playerA, setPlayerA] = useState(null);
  const [playerB, setPlayerB] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [text, setText] = useState("");
  const [typedTextA, setTypedTextA] = useState("");
  const [typedTextB, setTypedTextB] = useState("");
  const [lobbyError, setLobbyError] = useState(null);
  const [isLobbyValid, setIsLobbyValid] = useState(false);
  const [lobbyInput, setLobbyInput] = useState("");
  const [shouldJoinLobby, setShouldJoinLobby] = useState(false);
  const [gameTime] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameEnded, setGameEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const typingContainerARef = React.useRef(null);
  const typingContainerBRef = React.useRef(null);
  const auth = getAuth();
  const [showChart, setShowChart] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Sample text for typing
  const sampleText = "The quick brown fox jumped over the lazy dog.";

  const getRandomTextSegment = () => {
    // Split the large text into words
    const words = largeSampleText.split(/\s+/).filter(word => word.length > 0);
    
    // Determine how many words to include (you can make this random if you want)
    const wordCount = 100; // For example, get 50 words
    
    // Ensure we don't try to get more words than exist in the text
    const maxStartIndex = Math.max(0, words.length - wordCount);
    
    // Select a random starting point
    const startIndex = Math.floor(Math.random() * maxStartIndex);
    
    // Get the contiguous block of words
    const selectedWords = words.slice(startIndex, startIndex + wordCount);
    
    // Join them back into a string
    return selectedWords.join(" ");
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        setUser(user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });
    return unsubscribe;
  }, [auth]);

  // Set sample text when lobby is created or joined
  useEffect(() => {
    if (lobbyId) {
      setText(sampleText);
    }
  }, [lobbyId]);

  // Add this to your existing useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      const container =
        playerA?.uid === user?.uid
          ? typingContainerARef.current
          : typingContainerBRef.current;
      if (container && document.activeElement !== container) {
        container.focus();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [playerA, playerB, user]);
  useEffect(() => {
    if (gameStarted) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        const container =
          playerA?.uid === user?.uid
            ? typingContainerARef.current
            : typingContainerBRef.current;

        if (container) {
          container.focus();
          // Ensure the container is scrollable and visible
          container.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }
  }, [gameStarted, playerA, playerB, user]);

  useEffect(() => {
    if (!lobbyId) return;

    let unsubscribe = null;

    const checkAndSubscribe = async (attempt = 1) => {
      const lobbyRef = doc(db, "lobbies", lobbyId);
      const lobbySnap = await getDoc(lobbyRef);

      if (lobbySnap.exists()) {
        const data = lobbySnap.data();

        const isPlayer =
          data.playerA?.uid === user?.uid || data.playerB?.uid === user?.uid;

        if (!isPlayer) {
          if (attempt === 1) {
            setTimeout(() => checkAndSubscribe(2), 0);
          } else {
            setLobbyError("Cannot join. Lobby is full.");
            setLobbyId("");
          }
          return;
        }

        unsubscribe = onSnapshot(lobbyRef, (doc) => {
          if (doc.exists()) {
            const liveData = doc.data();

            setText(liveData.text);
            setPlayerA(liveData.playerA);
            setPlayerB(liveData.playerB);
            setGameStarted(liveData.gameStarted);
            setCountdown(liveData.countdown);
            setGameEnded(liveData.gameEnded);

            if (liveData.playerA?.uid === user?.uid) {
              setTypedTextA(liveData.playerA?.typedText || "");
            }
            if (liveData.playerB?.uid === user?.uid) {
              setTypedTextB(liveData.playerB?.typedText || "");
            }

            setLobbyError(null);
            setIsLobbyValid(true);
          } else {
            setLobbyError("Lobby not found. Please check the Lobby ID.");
            setIsLobbyValid(false);
          }
        });
      } else {
        setLobbyError("Lobby not found.");
        setLobbyId("");
      }
    };

    checkAndSubscribe();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [lobbyId, user?.uid]);

  // Handle the Create Lobby Button
  const createLobby = async () => {
    const newLobbyId = generateLobbyId();
    const player = {
      uid: user.uid,
      email: user.email,
      typedText: "",
      wpm: 0,
    };

    const lobbyRef = doc(db, "lobbies", newLobbyId);
    await setDoc(lobbyRef, {
      playerA: player,
      playerB: null,
      text: getRandomTextSegment(),
      gameStarted: false,
      gameEnded: false,
      canJoin: true,
      playerCount: 1, // Track player count
    });
    setLobbyId(newLobbyId);
  };

  // In your joinLobby function:
  const joinLobby = async () => {
    if (!lobbyId || lobbyId.length < 6) return;

    const lobbyRef = doc(db, "lobbies", lobbyId);
    const lobbyDoc = await getDoc(lobbyRef);

    if (lobbyDoc.exists()) {
      const data = lobbyDoc.data();

      let lobbyData = lobbyDoc.data();

      // Prevent joining if game started or lobby full
      if (data.gameStarted || !data.canJoin) {
        setLobbyError("Game has already started. Cannot join now.");
        return;
      }

      // Check if user is already in lobby
      const isPlayerA = lobbyData.playerA?.uid === user.uid;
      const isPlayerB = lobbyData.playerB?.uid === user.uid;

      // Check if current user is already in the lobby
      if (
        !isPlayerA &&
        !isPlayerB &&
        !lobbyData.playerB &&
        lobbyData.playerCount < 2
      ) {
        const player = {
          uid: user.uid,
          email: user.email,
          typedText: "",
          wpm: 0,
        };
        await updateDoc(lobbyRef, {
          playerB: player,
          canJoin: false,
          playerCount: 2, // Update player count
        });

        let updated = false;
        while (!updated) {
          const snapshot = await getDoc(lobbyRef);
          const updatedData = snapshot.data();
          if (updatedData?.playerB?.uid === user.uid) {
            updated = true;
            lobbyData = updatedData; // 👈 update our local data too
          } else {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }

        if (
          lobbyData.playerA?.uid !== user.uid &&
          lobbyData.playerB?.uid !== user.uid
        ) {
          setLobbyError("You are not authorized to view this lobby");
          setLobbyId(""); // Reset lobby
          return;
        }
      }

      if (!data.playerB) {
        const player = {
          uid: user.uid,
          email: user.email,
          typedText: "",
          wpm: 0,
        };
        await updateDoc(lobbyRef, {
          playerB: player,
          canJoin: false, // Close the lobby after Player B joins
        });
      } else {
        setLobbyError("Lobby is already full. Only 2 players allowed.");
      }
    } else {
      setLobbyError("Lobby not found. Please check the Lobby ID.");
    }
  };

  useEffect(() => {
    if (shouldJoinLobby && lobbyId.length >= 6) {
      joinLobby();
      setShouldJoinLobby(false); // reset flag
    }
  }, [shouldJoinLobby, lobbyId]);

  const generateLobbyId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const startGame = async () => {
    const lobbyRef = doc(db, "lobbies", lobbyId);
    const lobbyDoc = await getDoc(lobbyRef);

    if (lobbyDoc.exists()) {
      const data = lobbyDoc.data();

      // Prevent starting if Player B hasn't joined
      if (!data.playerB) {
        setLobbyError("Waiting for Player B to join");
        return;
      }

      const gameEndTime = new Date();
      gameEndTime.setSeconds(gameEndTime.getSeconds() + gameTime);

      await updateDoc(lobbyRef, {
        gameStarted: true,
        countdownStart: serverTimestamp(),
        gameEndTime: gameEndTime,
        canJoin: false, // Ensure no more players can join
      });

      setGameStarted(true);

      // Start countdown
      // let countdownValue = 3;
      // const countdownInterval = setInterval(() => {
      //   if (countdownValue > 0) {
      //     setCountdown(countdownValue);
      //     countdownValue -= 1;
      //   } else {
      //     clearInterval(countdownInterval);
      //     setCountdown(0);
      //   }
      // }, 1000);
    }
  };

  useEffect(() => {
    if (!gameStarted) return;

    const syncTimer = async () => {
      try {
        const lobbyRef = doc(db, "lobbies", lobbyId);
        const lobbyDoc = await getDoc(lobbyRef);

        if (!lobbyDoc.exists()) {
          console.warn("Lobby document doesn't exist");
          return;
        }

        const data = lobbyDoc.data();
        if (!data.gameEndTime) {
          console.warn("No gameEndTime found in lobby data");
          return;
        }

        // Use serverTimestamp if available for better synchronization
        const serverNow = data.serverTime || serverTimestamp();
        const now = serverNow instanceof Date ? serverNow : new Date();
        const endTime = data.gameEndTime.toDate();

        const secondsLeft = Math.max(0, Math.round((endTime - now) / 1000));

        setTimeLeft(secondsLeft);

        if (secondsLeft <= 0 && !gameEnded) {
          setGameEnded(true);
          // Update Firestore to mark game as ended
          await updateDoc(lobbyRef, { gameEnded: true });
        }
      } catch (error) {
        console.error("Error in syncTimer:", error);
      }
    };

    const timer = setInterval(syncTimer, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, lobbyId]);

  // Modify handleTypingA and handleTypingB to update Firestore
  const handleTypingA = async (e) => {
    if (!gameStarted) return;
    
    // Prevent default only after checking our conditions
    e.preventDefault();
    
    const key = e.key;
    console.log("Key pressed:", key); // Debug logging
  
    // Handle all printable characters
    if (key.length === 1 || key === "Backspace" || key === " ") {
      let newTypedText = typedTextA;
      
      if (key === "Backspace") {
        newTypedText = typedTextA.slice(0, -1);
      } else {
        newTypedText += key;
      }
  
      setTypedTextA(newTypedText);
  
      // Update Firestore
      const lobbyRef = doc(db, "lobbies", lobbyId);
      await updateDoc(lobbyRef, {
        "playerA.typedText": newTypedText,
        "playerA.wpm": calculateWPM(newTypedText, gameTime - timeLeft),
      });
    }
  };

  const handleTypingB = async (e) => {
    if (!gameStarted) return;

    e.preventDefault();
    const key = e.key;
    console.log("Key:", key);

    let newTypedText = typedTextB;

    if (key.length === 1 && key.match(/^[a-zA-Z0-9 .,!?'"-]$/)) {
      newTypedText += key;
    } else if (key === "Backspace") {
      newTypedText = newTypedText.slice(0, -1);
    }

    setTypedTextB(newTypedText);

    // Update Firestore
    const lobbyRef = doc(db, "lobbies", lobbyId);
    await updateDoc(lobbyRef, {
      "playerB.typedText": newTypedText,
      "playerB.wpm": calculateWPM(newTypedText, gameTime - timeLeft),
    });
  };

  // Add this helper function
  const calculateWPM = (typedText, elapsedSeconds) => {
    if (elapsedSeconds === 0) return 0;
    const words = typedText.trim().split(/\s+/).length;
    const minutes = elapsedSeconds / 60;
    return Math.round(words / minutes);
  };

  const determineWinner = () => {
    if (!gameEnded) return null;
    if (!playerA || !playerB) return "Not enough players";

    const playerAScore = calculateScore(playerA, text);
    const playerBScore = calculateScore(playerB, text);

    if (playerAScore > playerBScore) {
      return `${playerA.email} wins with ${
        playerA.wpm
      } WPM and ${calculateAccuracy(playerA.typedText || "", text)}% accuracy!`;
    } else if (playerBScore > playerAScore) {
      return `${playerB.email} wins with ${
        playerB.wpm
      } WPM and ${calculateAccuracy(playerB.typedText || "", text)}% accuracy!`;
    } else {
      return `It's a tie! Both scored ${
        playerA.wpm
      } WPM and ${calculateAccuracy(playerA.typedText || "", text)}% accuracy`;
    }
  };

  // Add this helper function
  const calculateAccuracy = (typedText, originalText) => {
    if (!typedText || !originalText || originalText.length === 0) return 0;

    let correctChars = 0;
    const minLength = Math.min(typedText.length, originalText.length);

    for (let i = 0; i < minLength; i++) {
      if (typedText[i] === originalText[i]) {
        correctChars++;
      }
    }

    const accuracy = (correctChars / originalText.length) * 100;
    return Math.round(accuracy);
  };

  const handleRematch = async () => {
    setIsLoading(true);
    try {
      const lobbyRef = doc(db, "lobbies", lobbyId);
      await updateDoc(lobbyRef, {
        gameStarted: false,
        gameEnded: false,
        text: getRandomTextSegment(),
        // countdown: 3,
        "playerA.typedText": "",
        "playerA.wpm": 0,
        "playerB.typedText": "",
        "playerB.wpm": 0,
        gameEndTime: null,
      });

      setTypedTextA("");
      setTypedTextB("");
      setTimeLeft(gameTime);
    } catch (error) {
      console.error("Error starting rematch:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const calculateScore = (player, originalText) => {
    const wpm = player.wpm || 0;
    const accuracy = calculateAccuracy(player.typedText || "", originalText);
    return wpm * 0.7 + accuracy * 0.3;
  };

  useEffect(() => {
    if (gameStarted) {
      const container =
        playerA?.uid === user?.uid
          ? typingContainerARef.current
          : typingContainerBRef.current;

      if (container) {
        // Add slight delay to ensure DOM is ready
        setTimeout(() => {
          container.focus();
          // Force focus if needed
          if (document.activeElement !== container) {
            container.focus({ preventScroll: true });
          }
        }, 100);
      }
    }
  }, [gameStarted, playerA, playerB, user]);

  const GameResultChart = ({ playerA, playerB, text, onClose }) => {
    const calculateAccuracy = (typedText, originalText) => {
      if (!typedText || !originalText || originalText.length === 0) return 0;
      let correctChars = 0;
      const minLength = Math.min(typedText.length, originalText.length);
      for (let i = 0; i < minLength; i++) {
        if (typedText[i] === originalText[i]) correctChars++;
      }
      return Math.round((correctChars / originalText.length) * 100);
    };

    const data = {
      labels: ["WPM", "Accuracy"],
      datasets: [
        {
          label: playerA?.email || "Player A",
          data: [
            playerA?.wpm || 0,
            calculateAccuracy(playerA?.typedText || "", text),
          ],
          backgroundColor: "rgba(54, 162, 235, 0.7)",
        },
        {
          label: playerB?.email || "Player B",
          data: [
            playerB?.wpm || 0,
            calculateAccuracy(playerB?.typedText || "", text),
          ],
          backgroundColor: "rgba(255, 99, 132, 0.7)",
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    };

    return (
      <div className="chart-modal">
        <div className="chart-content">
          <button
            className="chart-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>
          <div className="chart-container">
            <Bar data={data} options={options} />
          </div>
        </div>
      </div>
    );
  };

  // Chat Firestore listener
  useEffect(() => {
    if (!lobbyId) return;

    const q = query(
      collection(db, "lobbies", lobbyId, "messages"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse();
      setMessages(chatData);
    });

    return () => unsubscribe();
  }, [lobbyId]);

  const sendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !user?.uid || !lobbyId) return;
    const lobbyRef = doc(db, "lobbies", lobbyId);
    const lobbyDoc = await getDoc(lobbyRef);

    if (!lobbyDoc.exists()) return;

    const lobbyData = lobbyDoc.data();
    if (
      lobbyData.playerA.uid !== user.uid &&
      (!lobbyData.playerB || lobbyData.playerB.uid !== user.uid)
    ) {
      return; // User is not in this lobby
    }
    const messagesRef = collection(db, "lobbies", lobbyId, "messages");
    await addDoc(collection(db, "lobbies", lobbyId, "messages"), {
      text: trimmed,
      senderId: user.uid,
      senderEmail: user.email,
      timestamp: serverTimestamp(),
    });
    // Delete messages if over 50
    const snapshot = await getDocs(
      query(messagesRef, orderBy("timestamp", "asc"))
    );

    if (snapshot.size > 50) {
      const excess = snapshot.size - 50;
      const deletions = snapshot.docs
        .slice(0, excess)
        .map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletions);
    }
    setNewMessage("");
  };

  const cleanupChat = async () => {
    const messagesRef = collection(db, "lobbies", lobbyId, "messages");
    const snapshot = await getDocs(messagesRef);
    const deletes = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletes);
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="multiplayer-page-container">
      {!isLoggedIn ? (
        <div className="auth-container">
          <p>Please log in to play multiplayer.</p>
        </div>
      ) : (
        <div className="multiplayer-layout">
          <div className="game-container">
            <h1 className="game-title">Multiplayer Typing Duel</h1>

            {!lobbyId ? (
              <div className="lobby-creation">
                <div className="lobby-actions">
                  <button
                    onClick={createLobby}
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Lobby"}
                  </button>
                  <div className="divider">OR</div>
                  <div className="join-section">
                    <input
                      type="text"
                      placeholder="Enter Lobby ID"
                      value={lobbyInput}
                      onChange={(e) => setLobbyInput(e.target.value)}
                      className="lobby-input"
                    />
                    <button
                      onClick={() => {
                        setLobbyId(lobbyInput);
                        setShouldJoinLobby(true);
                      }}
                      className=" btn-secondary"
                      disabled={
                        !lobbyInput ||
                        lobbyInput.length < 6 ||
                        isLoading ||
                        (playerB && playerB.uid !== user?.uid) ||
                        gameStarted
                      }
                    >
                      {isLoading ? "Joining..." : "Join Lobby"}
                    </button>
                  </div>
                </div>
                {lobbyError && <p className="error-message">{lobbyError}</p>}
              </div>
            ) : (
              <div className="game-content">
                <div className="lobby-header">
                  <div className="lobby-info">
                    <h2>
                      Lobby: <span className="lobby-id">{lobbyId}</span>
                    </h2>
                    <div className="player-status">
                      <div
                        className={`player-badge ${
                          playerA?.uid === user?.uid ? "you" : ""
                        }`}
                      >
                        <span className="player-name">{playerA?.email}</span>
                        {playerA?.uid === user?.uid && (
                          <span className="you-indicator">YOU</span>
                        )}
                      </div>
                      {playerB && (
                        <div
                          className={`player-badge ${
                            playerB?.uid === user?.uid ? "you" : ""
                          }`}
                        >
                          <span className="player-name">{playerB?.email}</span>
                          {playerB?.uid === user?.uid && (
                            <span className="you-indicator">YOU</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {!gameStarted && (
                    <div className="lobby-state">
                      {playerB ? (
                        <div className="status-tag full">Ready</div>
                      ) : (
                        <div className="status-tag waiting">
                          Waiting for opponent
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {gameEnded ? (
                  <div className="game-results">
                    <h2 className="results-title">Game Over!</h2>
                    <p className="winner-announcement">{determineWinner()}</p>

                    <div className="performance-stats">
                      <div className="player-stats">
                        <h3>Player A</h3>
                        <div className="stat">
                          <span className="stat-label">WPM:</span>
                          <span className="stat-value">
                            {playerA?.wpm || 0}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Accuracy:</span>
                          <span className="stat-value">
                            {calculateAccuracy(playerA?.typedText || "", text)}%
                          </span>
                        </div>
                      </div>
                      {playerB && (
                        <div className="player-stats">
                          <h3>Player B</h3>
                          <div className="stat">
                            <span className="stat-label">WPM:</span>
                            <span className="stat-value">
                              {playerB?.wpm || 0}
                            </span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Accuracy:</span>
                            <span className="stat-value">
                              {calculateAccuracy(
                                playerB?.typedText || "",
                                text
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="results-actions">
                      <button
                        className="btn btn-chart"
                        onClick={() => setShowChart(true)}
                      >
                        View Performance Chart
                      </button>
                      <div className="rematch-options">
                        {(playerA?.uid === user?.uid ||
                          playerB?.uid === user?.uid) && (
                          <button
                            onClick={handleRematch}
                            className="btn btn-primary"
                            disabled={isLoading}
                          >
                            {isLoading ? "Preparing..." : "Rematch"}
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            await cleanupChat();
                            setLobbyId("");
                          }}
                          className="btn btn-exit btnLobby"
                        >
                          Exit Lobby
                        </button>
                      </div>
                    </div>

                    {showChart && (
                      <GameResultChart
                        playerA={playerA}
                        playerB={playerB}
                        text={text}
                        onClose={() => setShowChart(false)}
                      />
                    )}
                  </div>
                ) : gameStarted ? (
                  <div className="typing-game">
                    <div className="game-meta">
                      <div className="timer">
                        <span className="time-left">{timeLeft}</span> seconds
                        remaining
                      </div>
                      <div className="wpm-display">
                        Your WPM:{" "}
                        {playerA?.uid === user?.uid
                          ? playerA?.wpm || 0
                          : playerB?.wpm || 0}
                      </div>
                    </div>

                    <div className="typing-arena">
                      {playerA?.uid === user?.uid && (
                        <div className="typing-section">
                          <h3 className="player-label">Your Typing</h3>
                          <div
                            className="typing-field"
                            tabIndex={0}
                            onKeyDown={
                              playerA?.uid === user?.uid
                                ? handleTypingA
                                : handleTypingB
                            }
                            ref={
                              playerA?.uid === user?.uid
                                ? typingContainerARef
                                : typingContainerBRef
                            }
                            // Add these props
                            autoFocus
                            onFocus={(e) => e.target.focus()}
                            style={{ outline: "none" }}
                          >
                            {text.split("").map((char, index) => {
                              const typedChar = typedTextA[index];
                              let className = "";
                              if (typedChar == null) {
                                className =
                                  index === typedTextA.length
                                    ? "current-char"
                                    : "pending-char";
                              } else if (typedChar === char) {
                                className = "correct-char";
                              } else {
                                className = "incorrect-char";
                              }
                              return (
                                <span key={index} className={className}>
                                  {char}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {playerB?.uid === user?.uid && (
                        <div className="typing-section">
                          <h3 className="player-label">Your Typing</h3>
                          <div
                            className="typing-field"
                            tabIndex={0}
                            onKeyDown={handleTypingB}
                            ref={typingContainerBRef}
                          >
                            {text.split("").map((char, index) => {
                              const typedChar = typedTextB[index];
                              let className = "";
                              if (typedChar == null) {
                                className =
                                  index === typedTextB.length
                                    ? "current-char"
                                    : "pending-char";
                              } else if (typedChar === char) {
                                className = "correct-char";
                              } else {
                                className = "incorrect-char";
                              }
                              return (
                                <span key={index} className={className}>
                                  {char}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="game-start">
                    {playerA?.uid === user?.uid && (
                      <button
                        onClick={startGame}
                        className="btn btn-start"
                        disabled={isLoading || !playerB}
                      >
                        {isLoading
                          ? "Starting..."
                          : playerB
                          ? "Start Game"
                          : "Waiting for opponent..."}
                      </button>
                    )}
                    {playerB?.uid === user?.uid && (
                      <div className="waiting-message">
                        <div className="spinner"></div>
                        <p>Waiting for host to start the game...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {lobbyId && (
            <div className="chat-panel">
              <div className="chat-header">
                <h3>Live Chat</h3>
              </div>
              <div className="messages-container">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.senderId === user?.uid ? "sent" : "received"
                    }`}
                  >
                    <div className="message-sender">{msg.senderEmail}</div>
                    <div className="message-content">{msg.text}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form
                className="message-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                />
                <button type="submit" className="send-button">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 2L11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiplayerPage;
