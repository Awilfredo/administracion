<div style="background-color: #f7f7f7; padding: 20px; border: 1px solid #ddd; border-radius: 5px; font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2c3e50; text-align: center;">Usuario de Presupuestos Creado</h2>
    <p>Hola <?php echo htmlspecialchars($nombre); ?>,</p>
    <p>Te informamos que tu usuario en la plataforma de Presupuestos se ha creado correctamente. A continuación, se te asignaron las credenciales para que puedas acceder:</p>
    <p><strong>Código (anacod):</strong> <?php echo htmlspecialchars($anacod); ?></p>
    <p><strong>Correo:</strong> <?php echo htmlspecialchars($email); ?></p>
    <p><strong>Contraseña temporal:</strong> <?php echo htmlspecialchars($password); ?></p>
    <p>Por seguridad, te recomendamos cambiar tu contraseña al primer ingreso.</p>
    <p>Saludos cordiales,</p>
</div>
