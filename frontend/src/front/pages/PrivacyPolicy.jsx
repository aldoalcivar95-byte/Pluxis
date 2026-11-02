import { Link } from "react-router-dom";

export const PrivacyPolicy = () => {
    return (
        <main className="privacy-page">

            {/* ==================================================
                FONDO
            ================================================== */}

            <div className="privacy-background"></div>


            {/* ==================================================
                CONTENIDO
            ================================================== */}

            <div className="privacy-overlay">

                <div className="container py-5">

                    <div className="privacy-card">

                        {/* CABECERA */}

                        <div className="privacy-header">
                            <span className="privacy-badge">
                                PLUXIS
                            </span>

                            <h1>
                                Política de Privacidad
                            </h1>

                            <p className="privacy-update">
                                Última actualización: octubre de 2026
                            </p>

                            <div className="privacy-intro">
                                <p>
                                    En Pluxis nos comprometemos a proteger la
                                    privacidad de nuestros usuarios y a tratar
                                    sus datos personales de forma transparente,
                                    segura y responsable.
                                </p>

                                <p>
                                    Esta Política de Privacidad explica qué
                                    datos recopilamos, para qué los utilizamos
                                    y cuáles son los derechos de los usuarios
                                    respecto a sus datos personales.
                                </p>
                            </div>
                        </div>


                        {/* ==================================================
                            1. RESPONSABLE
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>01</span>
                                Responsable del tratamiento
                            </h2>

                            <p>
                                El responsable del tratamiento de los datos
                                personales tratados a través de Pluxis es:
                            </p>

                            <div className="privacy-info-box">

                                <p>
                                    <strong>Nombre:</strong>{" "}
                                    [NOMBRE DEL RESPONSABLE]
                                </p>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    [EMAIL DE CONTACTO]
                                </p>

                                <p>
                                    <strong>Domicilio:</strong>{" "}
                                    [DOMICILIO DEL RESPONSABLE]
                                </p>

                            </div>

                            <p className="privacy-note">
                                Estos datos deberán sustituirse por los datos
                                reales del responsable antes de utilizar Pluxis
                                como servicio comercial.
                            </p>

                        </section>


                        {/* ==================================================
                            2. DATOS
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>02</span>
                                Datos personales que recopilamos
                            </h2>

                            <p>
                                Dependiendo del uso que hagas de Pluxis,
                                podemos tratar los siguientes datos personales:
                            </p>

                            <ul>
                                <li>Nombre.</li>
                                <li>Dirección de correo electrónico.</li>
                                <li>Contraseña de acceso.</li>
                                <li>
                                    Información relacionada con las reservas.
                                </li>
                                <li>
                                    Información relacionada con los eventos
                                    creados por organizadores.
                                </li>
                                <li>
                                    Información técnica necesaria para el
                                    funcionamiento del servicio.
                                </li>
                            </ul>

                            <div className="privacy-highlight">
                                <strong>Seguridad de las contraseñas:</strong>
                                <br />
                                Las contraseñas de los usuarios se almacenan
                                utilizando mecanismos de protección y no se
                                almacenan en texto plano.
                            </div>

                        </section>


                        {/* ==================================================
                            3. FINALIDAD
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>03</span>
                                Finalidad del tratamiento
                            </h2>

                            <p>
                                Los datos personales se utilizan para las
                                siguientes finalidades:
                            </p>

                            <ul>
                                <li>
                                    Crear y gestionar la cuenta de usuario.
                                </li>

                                <li>
                                    Permitir el inicio de sesión y
                                    autenticación.
                                </li>

                                <li>
                                    Gestionar las reservas de eventos.
                                </li>

                                <li>
                                    Mostrar información necesaria para la
                                    gestión de eventos y reservas.
                                </li>

                                <li>
                                    Permitir a los organizadores gestionar sus
                                    propios eventos.
                                </li>

                                <li>
                                    Gestionar procesos de recuperación y
                                    restablecimiento de contraseñas.
                                </li>

                                <li>
                                    Mantener la seguridad y funcionamiento
                                    correcto de la plataforma.
                                </li>
                            </ul>

                        </section>


                        {/* ==================================================
                            4. BASE JURÍDICA
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>04</span>
                                Base jurídica
                            </h2>

                            <p>
                                El tratamiento de los datos personales podrá
                                basarse, según el caso, en las siguientes bases
                                jurídicas:
                            </p>

                            <ul>

                                <li>
                                    <strong>Ejecución de un contrato:</strong>{" "}
                                    para realizar las funcionalidades
                                    solicitadas por el usuario, como la gestión
                                    de su cuenta y sus reservas.
                                </li>

                                <li>
                                    <strong>Consentimiento:</strong>{" "}
                                    cuando sea necesario obtenerlo para una
                                    finalidad concreta.
                                </li>

                                <li>
                                    <strong>Obligación legal:</strong>{" "}
                                    cuando el tratamiento sea necesario para
                                    cumplir una obligación legal aplicable.
                                </li>

                                <li>
                                    <strong>Interés legítimo:</strong>{" "}
                                    cuando resulte aplicable y se hayan
                                    realizado las correspondientes
                                    comprobaciones de proporcionalidad.
                                </li>

                            </ul>

                        </section>


                        {/* ==================================================
                            5. RESERVAS
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>05</span>
                                Gestión de reservas
                            </h2>

                            <p>
                                Cuando un usuario realiza una reserva a través
                                de Pluxis, podemos tratar la información
                                necesaria para gestionar dicha reserva,
                                incluyendo el usuario, el evento, el número de
                                entradas, la fecha de la reserva y su estado.
                            </p>

                            <p>
                                Esta información permite mantener un registro
                                de las reservas realizadas y facilitar la
                                gestión de los eventos.
                            </p>

                        </section>


                        {/* ==================================================
                            6. ORGANIZADORES
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>06</span>
                                Información para organizadores
                            </h2>

                            <p>
                                Los usuarios que dispongan de permisos de
                                organizador pueden crear y gestionar eventos
                                dentro de la plataforma.
                            </p>

                            <p>
                                Los organizadores podrán acceder a la
                                información necesaria para gestionar las
                                reservas asociadas a sus propios eventos.
                            </p>

                        </section>


                        {/* ==================================================
                            7. CONSERVACIÓN
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>07</span>
                                Conservación de los datos
                            </h2>

                            <p>
                                Los datos personales se conservarán durante el
                                tiempo necesario para cumplir las finalidades
                                para las que fueron recopilados y mientras
                                exista una relación con el usuario.
                            </p>

                            <p>
                                Cuando los datos ya no sean necesarios, podrán
                                conservarse durante los plazos establecidos por
                                las obligaciones legales aplicables.
                            </p>

                        </section>


                        {/* ==================================================
                            8. SEGURIDAD
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>08</span>
                                Seguridad
                            </h2>

                            <p>
                                Pluxis aplica medidas técnicas y organizativas
                                destinadas a proteger los datos personales
                                frente a accesos no autorizados, pérdida,
                                alteración o divulgación indebida.
                            </p>

                        </section>


                        {/* ==================================================
                            9. DESTINATARIOS
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>09</span>
                                Destinatarios de los datos
                            </h2>

                            <p>
                                Los datos personales no se comunicarán a
                                terceros salvo cuando sea necesario para
                                prestar el servicio, exista una obligación
                                legal o el usuario haya otorgado su
                                consentimiento cuando corresponda.
                            </p>

                        </section>


                        {/* ==================================================
                            10. TRANSFERENCIAS
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>10</span>
                                Transferencias internacionales
                            </h2>

                            <p>
                                En caso de utilizar servicios tecnológicos
                                cuyos proveedores se encuentren fuera del
                                Espacio Económico Europeo, las transferencias
                                internacionales de datos se realizarán
                                conforme a las garantías exigidas por la
                                normativa aplicable.
                            </p>

                        </section>


                        {/* ==================================================
                            11. DERECHOS
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>11</span>
                                Derechos de los usuarios
                            </h2>

                            <p>
                                Los usuarios pueden ejercer los derechos
                                reconocidos por la normativa de protección de
                                datos, entre ellos:
                            </p>

                            <ul>
                                <li>Derecho de acceso.</li>
                                <li>Derecho de rectificación.</li>
                                <li>Derecho de supresión.</li>
                                <li>Derecho a la limitación del tratamiento.</li>
                                <li>Derecho a la portabilidad.</li>
                                <li>Derecho de oposición.</li>
                            </ul>

                            <div className="privacy-contact-box">

                                <strong>
                                    Para ejercer estos derechos:
                                </strong>

                                <p>
                                    Contacta con nosotros a través de:
                                </p>

                                <p>
                                    <strong>
                                        [EMAIL DE CONTACTO]
                                    </strong>
                                </p>

                            </div>

                        </section>


                        {/* ==================================================
                            12. COOKIES
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>12</span>
                                Cookies
                            </h2>

                            <p>
                                Pluxis podrá utilizar cookies y tecnologías
                                similares necesarias para el funcionamiento
                                técnico de la plataforma.
                            </p>

                            <p>
                                En caso de incorporar cookies de análisis,
                                publicidad u otras tecnologías no estrictamente
                                necesarias, se proporcionará la información y
                                mecanismos de consentimiento correspondientes.
                            </p>

                        </section>


                        {/* ==================================================
                            13. CAMBIOS
                        ================================================== */}

                        <section className="privacy-section">

                            <h2>
                                <span>13</span>
                                Cambios en la política de privacidad
                            </h2>

                            <p>
                                Pluxis podrá actualizar esta Política de
                                Privacidad cuando resulte necesario para
                                adaptarla a cambios legales, técnicos o
                                funcionales de la plataforma.
                            </p>

                            <p>
                                La versión actualizada estará disponible en
                                esta misma página.
                            </p>

                        </section>


                        {/* ==================================================
                            14. CONTACTO
                        ================================================== */}

                        <section className="privacy-section privacy-last">

                            <h2>
                                <span>14</span>
                                Contacto
                            </h2>

                            <p>
                                Para cualquier cuestión relacionada con esta
                                Política de Privacidad o con el tratamiento de
                                datos personales, puedes contactar con Pluxis
                                mediante:
                            </p>

                            <div className="privacy-contact-box">

                                <p>
                                    <strong>Email:</strong>{" "}
                                    [EMAIL DE CONTACTO]
                                </p>

                            </div>

                        </section>


                        {/* ==================================================
                            VOLVER
                        ================================================== */}

                        <div className="privacy-back">

                            <Link
                                to="/"
                                className="btn btn-dark"
                            >
                                ← Volver a Pluxis
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
};