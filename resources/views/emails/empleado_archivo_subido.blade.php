<div style="background-color: #f7f7f7; padding: 20px; border: 1px solid #ddd; border-radius: 5px; font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2c3e50; text-align: center;">Archivo cargado en datos de empleado</h2>
    <p>Se han cargado archivos en la sección de datos del siguiente empleado:</p>
    <ul>
        <li><strong>Nombre:</strong> <?php echo htmlspecialchars($empleadoNombre); ?></li>
        <li><strong>Código:</strong> <?php echo htmlspecialchars($empleadoAnacod); ?></li>
        <?php if ($area): ?>
            <li><strong>Área:</strong> <?php echo htmlspecialchars($area); ?></li>
        <?php endif; ?>
        <?php if ($puesto): ?>
            <li><strong>Puesto:</strong> <?php echo htmlspecialchars($puesto); ?></li>
        <?php endif; ?>
    </ul>
    <h3 style="color: #2c3e50;">Archivos cargados</h3>
    <ul>
        <li><strong>Descripción:</strong> <?php echo htmlspecialchars($nombreArchivo); ?></li>
        <li><strong>Nombre del archivo:</strong> <?php echo htmlspecialchars($nombreOriginal); ?></li>
    </ul>
    <p><strong>Cargado por:</strong> <?php echo htmlspecialchars($usuarioSubidor ?: 'Sistema'); ?></p>
    <p><strong>Fecha:</strong> <?php echo htmlspecialchars($fechaSubida); ?></p>
    <p>Los archivos se encuentran adjuntos a este mensaje.</p>
    <p>Saludos cordiales,<br>Administración</p>
</div>
