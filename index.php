<?php
session_start();

/* ============================== CONFIGURATION SUPABASE ================================= */

$project_url = "https://xrsebcwlbekugvpwqcii.supabase.co";
$api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyc2ViY3dsYmVrdWd2cHdxY2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTkxNzksImV4cCI6MjA4NzYzNTE3OX0.laxq2_POjoitWv8J0RQNo5SiBXvs2yzmtAaoxWje7Vo"; // ⚠️ Mets ta clé ici (évite de la publier)

/* ============================== LOGIN ================================= */

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["login"])) {

    $email = trim($_POST["email"]);
    $password_input = trim($_POST["password"]);

    // 🔹 Requête filtrée (sécurisée)
    $url = $project_url . "/rest/v1/student?email=eq." . urlencode($email) . "&select=*";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $api_key",
        "Authorization: Bearer $api_key",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);

    if (!empty($data) && isset($data[0])) {

        $user = $data[0];

        if ($user["password"] === $password_input) {

            $_SESSION["student_id"] = $user["student_id"];
            $_SESSION["first_name"] = $user["first_name"];
            $_SESSION["last_name"] = $user["last_name"];
            $_SESSION["email"] = $user["email"];

            header("Location: index.php");
            exit();
        }
    }

    $error_message = "❌ Email ou mot de passe incorrect.";
}

/* ============================== LOGOUT ================================= */

if (isset($_GET["logout"])) {
    session_destroy();
    header("Location: index.php");
    exit();
}

/* ============================== QUESTION IA ================================= */

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["ask_ai"])) {

    $question = trim($_POST["question"]);
    $student_id = $_SESSION["student_id"];

    // 🔹 URL de ton webhook n8n
    $webhook_url = "https://n8n-6-k7ev.onrender.com/webhook-test/agentia";

    $payload = json_encode([
        "student_id" => $student_id,
        "question" => $question
    ]);

    $ch = curl_init($webhook_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

    $response = curl_exec($ch);

    if(curl_errno($ch)) {
        $ai_response_text = "Erreur connexion n8n.";
    } else {
        $decoded = json_decode($response, true);
        $ai_response_text = $decoded["message"] ?? "Pas de réponse reçue.";
    }

    curl_close($ch);
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Agent IA Université</title>
    <style>
        body { font-family: Arial; margin: 40px; }
        textarea { width: 400px; }
        .chat-box { background:#f2f2f2; padding:15px; margin-top:15px; border-radius:5px; }
        .error { color:red; }
    </style>
</head>

<body>

<?php if (!isset($_SESSION["student_id"])): ?>

    <h2>Connexion Étudiant</h2>

    <?php if (isset($error_message)) echo "<p class='error'>$error_message</p>"; ?>

    <form method="POST">
        <input type="hidden" name="login" value="1">

        <label>Email :</label><br>
        <input type="email" name="email" required><br><br>

        <label>Mot de passe :</label><br>
        <input type="password" name="password" required><br><br>

        <button type="submit">Se connecter</button>
    </form>

<?php else: ?>

    <h2>
        Bienvenue 
        <?php 
            echo htmlspecialchars($_SESSION["first_name"]) . " " . 
                 htmlspecialchars($_SESSION["last_name"]); 
        ?>
    </h2>

    <p>Email : <?php echo htmlspecialchars($_SESSION["email"]); ?></p>

    <a href="?logout=1">Déconnexion</a>

    <hr>

    <h3>Poser une question à l'Agent IA</h3>

    <form method="POST">
        <textarea name="question" rows="4" required></textarea><br><br>
        <button type="submit" name="ask_ai">Envoyer</button>
    </form>

    <?php if (isset($ai_response_text)): ?>
        <div class="chat-box">
            <strong>Réponse de l'Agent :</strong><br><br>
            <?php echo nl2br(htmlspecialchars($ai_response_text)); ?>
        </div>
    <?php endif; ?>

<?php endif; ?>

</body>
</html>
