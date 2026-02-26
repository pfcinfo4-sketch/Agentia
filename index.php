<?php
session_start();

/* ============================== CONFIGURATION SUPABASE ================================= */

$project_url = "https://xrsebcwlbekugvpwqcii.supabase.co";
$api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyc2ViY3dsYmVrdWd2cHdxY2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTkxNzksImV4cCI6MjA4NzYzNTE3OX0.laxq2_POjoitWv8J0RQNo5SiBXvs2yzmtAaoxWje7Vo"; // ⚠️ Remplace par ta vraie clé anon publique

/* ============================== LOGIN SUPABASE ================================= */

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["login"])) {

    $email = trim($_POST["email"]);
    $password_input = trim($_POST["password"]);

    // 🔥 On filtre directement par email (plus rapide)
       $url = $project_url . "/rest/v1/student?select=*";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $api_key",
        "Authorization: Bearer $api_key",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        die("Erreur cURL : " . curl_error($ch));
    }

    curl_close($ch);

    $data = json_decode($response, true);

    $login_success = false;

    if (!empty($data) && isset($data[0])) {

        $user = $data[0];

        if (
            strtolower(trim($user["email"])) === strtolower($email) &&
            trim($user["password"]) === $password_input
        ) {
            $_SESSION["student_id"] = $user["student_id"];
            $_SESSION["email"] = $user["email"];
            $login_success = true;
        }
    }

    if (!$login_success) {
        $error_message = "❌ Email ou mot de passe incorrect.";
    }
}

/* ============================== LOGOUT ================================= */

if (isset($_GET["logout"])) {
    session_destroy();
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Agent IA Université</title>
</head>

<body>

<?php if (!isset($_SESSION["student_id"])): ?>

    <!-- ================= LOGIN ================= -->

    <h2>Connexion Étudiant</h2>

    <?php if (isset($error_message)) echo "<p style='color:red;'>$error_message</p>"; ?>

    <form method="POST">
        <input type="hidden" name="login" value="1">

        <label>Email :</label><br>
        <input type="email" name="email" required><br><br>

        <label>Mot de passe :</label><br>
        <input type="password" name="password" required><br><br>

        <button type="submit">Se connecter</button>
    </form>

<?php else: ?>

    <!-- ================= CHAT ================= -->

    <h2>Bienvenue <?php echo htmlspecialchars($_SESSION["email"]); ?></h2>
    <a href="?logout=1">Déconnexion</a>

    <hr>

    <h3>Agent IA</h3>

    <input type="text" id="question" placeholder="Posez votre question..." style="width:300px;">
    <button onclick="sendQuestion()">Envoyer</button>

    <div id="response" style="margin-top:20px; font-weight:bold;"></div>

    <script>
        function sendQuestion() {

            let question = document.getElementById("question").value;

            if (!question) {
                document.getElementById("response").innerText = "Veuillez entrer une question.";
                return;
            }

            fetch("https://n8n-9-dtnb.onrender.com/webhook-test/student-log", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: question,
                    student_id: "<?php echo $_SESSION["student_id"]; ?>"
                })
            })
            .then(response => response.text())
            .then(text => {

                console.log("Texte reçu :", text);

                let data;

                try {
                    data = JSON.parse(text);
                } catch (e) {
                    document.getElementById("response").innerText = text;
                    return;
                }

                if (data.image) {
                    document.getElementById("response").innerHTML =
                        "<img src='" + data.image + "' width='900' style='margin-top:20px; border:2px solid #ccc;'>";
                } else if (data.reply) {
                    document.getElementById("response").innerText = data.reply;
                } else {
                    document.getElementById("response").innerText = "Réponse reçue.";
                }

            })
            .catch(error => {
                document.getElementById("response").innerText = "Erreur serveur.";
            });
        }
    </script>

<?php endif; ?>

</body>
</html>



