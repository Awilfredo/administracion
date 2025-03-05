<div style="background-color: #f7f7f7; padding: 20px; border: 1px solid #ddd; border-radius: 5px; font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2c3e50; text-align: center;">Usuario de <?php echo htmlspecialchars($aplicacion); ?></h2>
    <p>Hola <?php echo htmlspecialchars($name); ?>,</p>
    <p>Te informamos que tu usuario de <?php echo htmlspecialchars($aplicacion); ?> se ha creado correctamente. A continuación, se te asignaron las credenciales para que puedas acceder:</p>
    <p><strong>Usuario:</strong> <?php echo htmlspecialchars($user); ?></p>
    <p>Contraseña: <?php echo htmlspecialchars($password); ?></p>
    <p><strong>Correo asignado:</strong> <?php echo htmlspecialchars($email); ?></p>
    <p>Para acceder has <strong><a href="https://control.datared.com.sv/">click aqui</a></strong></p>
    <p>Saludos cordiales,</p>
</div>