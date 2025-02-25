<div style="background-color: #f7f7f7; padding: 20px; border: 1px solid #ddd; border-radius: 5px; font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2c3e50; text-align: center;">Usuario de SAN Creado</h2>
    <p>Hola <?php echo htmlspecialchars($name); ?>,</p>
    <p>Te informamos que tu usuario de SAN se ha creado correctamente. A continuación, se te asignaron las credenciales para que puedas acceder:</p>
    <p><strong>Usuario:</strong> <?php echo htmlspecialchars($user); ?></p>
    <p><strong>Correo asignado:</strong> <?php echo htmlspecialchars($email); ?></p>
    <p>Por favor, haz <a href="http://san.red.com.sv/site/recuperarPass.html">clic aquí</a> para crear una contraseña siguiendo las indicaciones.</p>
    <p>Saludos cordiales,</p>
</div>
