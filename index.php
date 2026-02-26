<?php
session_start();

/* ============================== CONFIGURATION SUPABASE ================================= */

$project_url = "https://xrsebcwlbekugvpwqcii.supabase.co";
$api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyc2ViY3dsYmVrdWd2cHdxY2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTkxNzksImV4cCI6MjA4NzYzNTE3OX0.laxq2_POjoitWv8J0RQNo5SiBXvs2yzmtAaoxWje7Vo";

/* ============================== LOGIN SUPABASE ================================= */

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["login"])) {

    $email = trim($_POST["email"]);
    $password_input = trim($_POST["password"]);

    // IMPORTANT : table = student
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
    curl_close($ch);

    $data = json_decode($response, true);

    $login_success = false;

    if (is_array($data)) {
        foreach ($data as $user) {

            if (
                trim($user["email"]) === $email &&
                trim($user["password"]) === $password_input
            ) {

                $_SESSION["student_id"] = $user["student_id"];
                $_SESSION["first_name"] = $user["first_name"];
                $_SESSION["last_name"] = $user["last_name"];
                $_SESSION["email"] = $user["email"];

                $login_success = true;
                break;
            }
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

    <h2>Connexion Étudiant</h2>

    <?php if (isset($error_message)) echo "<p>$error_message</p>"; ?>

    <form method="POST">
        <input type="hidden" name="login" value="1">

        <label>Email :</label><br>
        <input type="email" name="email" required><br><br>

        <label>Mot de passe :</label><br>
        <input type="password" name="password" required><br><br>

        <button type="submit">Se connecter</button>
    </form>

<?php else: ?>

    <!-- ================= APRES LOGIN ================= -->

    <h2>
        Bienvenue 
        <?php 
            echo htmlspecialchars($_SESSION["first_name"]) . " " . 
                 htmlspecialchars($_SESSION["last_name"]); 
        ?>
    </h2>

    <p>Email : <?php echo htmlspecialchars($_SESSION["email"]); ?></p>

    <a href="?logout=1">Déconnexion</a>

<?php endif; ?>

</body>
</html>
