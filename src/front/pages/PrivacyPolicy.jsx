import { Link } from "react-router-dom";

export const PrivacyPolicy = () => {
    return (
        <main className="privacy-page">
            <div className="privacy-background"></div>
            <div className="privacy-overlay">
                <div className="container py-5">
                    <div className="privacy-card">
                        <div className="privacy-header">
                            <span className="privacy-badge">PLUXIS</span>
                            <h1>Política de Privacidad</h1>
                            <p className="privacy-update">
                                Última actualización: noviembre de 2026
                            </p>
                            <div className="privacy-intro">
                                <p>
                                    Esta política describe cómo la plataforma académica Pluxis trata los datos personales necesarios para crear cuentas, consultar eventos y gestionar reservas.
                                </p>
                                <p>
                                    Los datos identificativos y de contacto que aparecen en esta versión son ficticios y se utilizan exclusivamente como ejemplo para la demostración del proyecto.
                                </p>
                            </div>
                        </div>

                        <section className="privacy-section">
                            <h2><span>01</span> Responsable del tratamiento</h2>
                            <p>Para esta demostración académica, los datos de contacto del responsable se han sustituido por datos inventados:</p>
                            <div className="privacy-info-box">
                                <p><strong>Responsable:</strong> Laura Martín Vega (identidad ficticia)</p>
                                <p><strong>Proyecto:</strong> Pluxis — plataforma de gestión de eventos</p>
                                <p><strong>Correo de privacidad:</strong> privacidad@pluxis.example</p>
                                <p><strong>Domicilio:</strong> Calle del Olmo 18, 45001 Toledo, España (dirección ficticia)</p>
                                <p><strong>Teléfono:</strong> +34 600 000 000 (número ficticio)</p>
                            </div>
                            <p className="privacy-note">
                                Estos datos no identifican a una persona o entidad real. Deben reemplazarse por los datos verídicos del responsable antes de ofrecer el servicio al público.
                            </p>
                        </section>

                        <section className="privacy-section">
                            <h2><span>02</span> Datos personales tratados</h2>
                            <p>En función de las funciones utilizadas, Pluxis puede tratar:</p>
                            <ul>
                                <li>Datos de cuenta: nombre, correo electrónico, contraseña almacenada mediante hash y rol asignado.</li>
                                <li>Datos de eventos: título, descripción, fecha, hora, ubicación, categoría, precio, capacidad e imagen.</li>
                                <li>Datos de reservas: evento, cantidad de entradas, fecha de creación y estado de la reserva.</li>
                                <li>Datos de ubicación: coordenadas del dispositivo cuando el usuario autoriza la geolocalización, o una ubicación introducida manualmente para buscar eventos cercanos.</li>
                                <li>Datos técnicos necesarios para la autenticación, seguridad y funcionamiento de la aplicación.</li>
                            </ul>
                            <div className="privacy-highlight">
                                <strong>Contraseñas:</strong> la aplicación utiliza bcrypt para almacenar hashes de contraseñas. No debe introducirse información sensible real en las cuentas de demostración.
                            </div>
                        </section>

                        <section className="privacy-section">
                            <h2><span>03</span> Finalidades del tratamiento</h2>
                            <ul>
                                <li>Crear, mantener y proteger las cuentas de usuario.</li>
                                <li>Autenticar a los usuarios y aplicar los permisos asociados a cada rol.</li>
                                <li>Mostrar eventos y sus detalles.</li>
                                <li>Calcular qué eventos se encuentran dentro de la ubicación y el radio seleccionados.</li>
                                <li>Crear, consultar y cancelar reservas, así como controlar el aforo disponible.</li>
                                <li>Permitir a los organizadores administrar sus propios eventos y consultar las reservas asociadas.</li>
                                <li>Gestionar solicitudes de recuperación y restablecimiento de contraseñas.</li>
                            </ul>
                        </section>

                        <section className="privacy-section">
                            <h2><span>04</span> Base jurídica</h2>
                            <p>En un servicio real, la base jurídica deberá determinarse para cada finalidad. A título orientativo, podría incluir:</p>
                            <ul>
                                <li><strong>Ejecución de medidas precontractuales o de un contrato:</strong> creación de cuenta y gestión de las reservas solicitadas.</li>
                                <li><strong>Consentimiento:</strong> acceso a la ubicación del dispositivo y otros tratamientos que lo requieran.</li>
                                <li><strong>Obligación legal:</strong> conservación o comunicación de información cuando una norma lo exija.</li>
                                <li><strong>Interés legítimo:</strong> seguridad y prevención de usos indebidos, previa ponderación correspondiente.</li>
                            </ul>
                        </section>

                        <section className="privacy-section">
                            <h2><span>05</span> Reservas y disponibilidad</h2>
                            <p>Al realizar una reserva se registra la cuenta que la solicita, el evento, la cantidad de entradas, la fecha de la operación y su estado. El sistema comprueba el aforo antes de confirmar la reserva y permite al usuario consultar o cancelar sus propias reservas.</p>
                            <p>La versión actual del proyecto no incorpora un proceso de pago integrado; por tanto, esta política no describe el tratamiento de datos de tarjetas bancarias.</p>
                        </section>

                        <section className="privacy-section">
                            <h2><span>06</span> Organizadores</h2>
                            <p>Las cuentas con rol de organizador pueden crear, editar y gestionar sus propios eventos. También pueden consultar la información necesaria para administrar las reservas vinculadas a esos eventos. El registro público crea cuentas de cliente; el rol de organizador se asigna de forma controlada.</p>
                        </section>

                        <section className="privacy-section">
                            <h2><span>07</span> Proveedores y destinatarios</h2>
                            <p>Para prestar las funciones técnicas, el proyecto puede utilizar los siguientes proveedores:</p>
                            <ul>
                                <li><strong>Render:</strong> alojamiento de la aplicación, la API y la base de datos.</li>
                                <li><strong>Cloudinary:</strong> almacenamiento y entrega de imágenes.</li>
                                <li><strong>Geoapify:</strong> geocodificación de ubicaciones y servicios de proximidad.</li>
                                <li><strong>Servicio SMTP:</strong> envío de mensajes relacionados con la recuperación de contraseñas.</li>
                            </ul>
                            <p>Los proveedores solo deben acceder a los datos necesarios para prestar sus servicios y deben quedar sujetos a los acuerdos y garantías correspondientes. En una implantación real habría que comprobar sus condiciones, ubicaciones de tratamiento y posibles transferencias internacionales.</p>
                        </section>

                        <section className="privacy-section">
                            <h2><span>08</span> Conservación de los datos</h2>
                            <p>Los datos se conservarían durante el tiempo necesario para prestar el servicio y gestionar la cuenta, los eventos y las reservas. Posteriormente, se suprimirían o bloquearían cuando proceda, salvo los datos que deban conservarse durante los plazos exigidos por la normativa aplicable.</p>
                            <p>Los plazos concretos deberán definirse antes de poner la plataforma en funcionamiento comercial.</p>
                        </section>

                        <section className="privacy-section">
                            <h2><span>09</span> Seguridad</h2>
                            <p>El proyecto incorpora autenticación JWT, hash de contraseñas mediante bcrypt, control de permisos por rol, validaciones de acceso a reservas y eventos, configuración CORS y uso de variables de entorno para las credenciales de servicios.</p>
                            <p>Ninguna medida elimina por completo el riesgo. Antes de un uso real sería necesario revisar la configuración, los registros, las copias de seguridad, la gestión de secretos y las medidas de seguridad de los proveedores.</p>
                        </section>

                        <section className="privacy-section">
                            <h2><span>10</span> Derechos de las personas usuarias</h2>
                            <p>Cuando resulte aplicable la normativa de protección de datos, las personas interesadas podrán ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar el consentimiento cuando el tratamiento se base en él.</p>
                            <div className="privacy-contact-box">
                                <strong>Contacto de demostración</strong>
                                <p>Correo: <strong>privacidad@pluxis.example</strong></p>
                                <p>Asunto recomendado: “Solicitud de protección de datos”.</p>
                                <p>En un servicio real, también se informará del derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).</p>
                            </div>
                        </section>

                        <section className="privacy-section">
                            <h2><span>11</span> Cookies y almacenamiento local</h2>
                            <p>La aplicación utiliza almacenamiento del navegador para mantener el estado de autenticación y la sesión de usuario. El alojamiento o las dependencias técnicas también podrían generar elementos estrictamente necesarios para prestar el servicio.</p>
                            <p>Si en el futuro se incorporan cookies de analítica, publicidad o tecnologías no necesarias, deberán identificarse y, cuando corresponda, solicitar el consentimiento antes de activarlas.</p>
                        </section>

                        <section className="privacy-section">
                            <h2><span>12</span> Menores de edad</h2>
                            <p>Pluxis no está diseñada específicamente para recoger datos de menores. En una explotación real se deberán establecer las medidas y comprobaciones de edad que correspondan conforme a la normativa aplicable.</p>
                        </section>

                        <section className="privacy-section">
                            <h2><span>13</span> Cambios en esta política</h2>
                            <p>Esta política podrá revisarse cuando cambien las funcionalidades, los proveedores o las obligaciones legales. La versión vigente se publicará en esta página e indicará su fecha de actualización.</p>
                        </section>

                        <section className="privacy-section privacy-last">
                            <h2><span>14</span> Contacto</h2>
                            <p>Para consultas sobre esta política o sobre el tratamiento de datos en esta demostración:</p>
                            <div className="privacy-contact-box">
                                <p><strong>Pluxis — Privacidad</strong></p>
                                <p><strong>Email:</strong> privacidad@pluxis.example</p>
                                <p><strong>Domicilio ficticio:</strong> Calle del Olmo 18, 45001 Toledo, España</p>
                            </div>
                        </section>

                        <div className="privacy-back">
                            <Link to="/" className="btn btn-dark">
                                ← Volver a Pluxis
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
