import { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import {
	Column,
	Toast,
	Button,
	Dialog,
	InputText,
	Dropdown,
	Divider,
} from "../../components/crud";
import { Conexion } from "../../service/Conexion";
import {
	TablaDatos,
	BarraSuperior,
	EliminarVentana,
	productDialogFooter,
} from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { setDataSet, setFormData } from "../../store/appSlice";
import { Cargando } from "../../components/crud/Cargando";
import { ImagenCampo } from "../../components/crud/ImagenCampo";
import { Carousel } from "primereact/carousel";

export const SeccionesCampanas = () => {
	const TABLA = "seccionescampana"; // Tabla a administrar
	let emptyFormData = {}; // Objeto vacío para inicializar el formulario
	const { dataSet, formData } = useSelector((state) => state.appsesion); // Datos del storage Redux
	const dispatch = useDispatch();
	const [productDialog, setProductDialog] = useState(false); // Estado para mostrar/ocultar el diálogo de edición
	const [deleteProductDialog, setDeleteProductDialog] = useState(false); // Estado para mostrar/ocultar el diálogo de eliminación
	const [submitted, setSubmitted] = useState(false); // Estado para manejar la validación del formulario
	const toast = useRef(null); // Referencia para mostrar notificaciones
	const [recargar, setrecargar] = useState(0); // Estado para recargar la tabla
	const [cargando, setCargando] = useState(false); // Estado para mostrar/ocultar el spinner de carga
	const datatable = new Conexion(); // Instancia de la clase Conexion para manejar las peticiones
	const [dropdownCapanias, setdropdownCapanias] = useState(null);
	const [products, setProducts] = useState([]);

	// Cargar los datos de la tabla al inicio o cuando se recargue
	useEffect(() => {
		setCargando(true);
		dispatch(setFormData(emptyFormData));

		// Obtener los datos de la tabla seccionescampana
		datatable.gettable(TABLA).then((data) => {
			dispatch(setDataSet(data)); // Guardar los datos en Redux
			setCargando(false);
		});
		// datatable.gettable("parametros/campanias").then((datos) => {
		// 	setdropdownCapanias(datos);
		// 	// console.log(datos);
		// });
	}, [recargar]);

	useEffect(() => {
		//solo para que se ejecute una vez al inicio

		datatable.gettable("parametros/campanias").then((datos) => {
			setdropdownCapanias(datos);
		});

		/** setting parametros dropdowns u otros objetos independientes */
	}, []);

	// Abrir el diálogo para crear una nueva sección
	const openNew = () => {
		dispatch(setFormData(emptyFormData)); // Limpiar el formulario
		setSubmitted(false);
		setProductDialog(true);
	};

	// Ocultar el diálogo de edición
	const hideDialog = () => {
		setSubmitted(false);
		setProductDialog(false);
	};

	// Ocultar el diálogo de eliminación
	const hideDeleteProductDialog = () => {
		setDeleteProductDialog(false);
	};

	// Editar una sección existente
	const editProduct = (id) => {
		setCargando(true);
		datatable
			.getItem(TABLA, id)
			.then((data) => dispatch(setFormData({ ...data.data })));
		setProductDialog(true);
		setCargando(false);
	};

	// Confirmar la eliminación de una sección
	const confirmDeleteProduct = (fila) => {
		dispatch(setFormData(fila)); // Guardar la fila seleccionada en el formulario
		setDeleteProductDialog(true);
	};

	// Mostrar notificación de éxito después de una transacción
	const trasaccionExitosa = (tipo = "") => {
		setrecargar(recargar + 1); // Recargar la tabla
		tipo === "borrar" ? setDeleteProductDialog(false) : hideDialog(); // Ocultar el diálogo correspondiente
		dispatch(setFormData(emptyFormData)); // Limpiar el formulario

		toast.current.show({
			severity: "success",
			summary: "Confirmación",
			detail: "Transacción Exitosa",
			life: 4000,
		});
	};

	// Guardar o actualizar una sección
	const saveProduct = () => {
		setSubmitted(true);
		if (formData.nom_sca?.trim()) {
			// Validar que el campo "nom_sca" no esté vacío
			if (formData.id == null) {
				// Crear una nueva sección
				datatable
					.getCrearItem(TABLA, formData)
					.then((data) => trasaccionExitosa());
			} else {
				// Actualizar una sección existente
				datatable
					.getEditarItem(TABLA, formData, formData.id)
					.then((data) => trasaccionExitosa());
			}
		}
	};

	// Eliminar una sección
	const deleteProduct = () =>
		datatable
			.getEliminarItem(TABLA, formData, formData.id)
			.then((data) => trasaccionExitosa("borrar"));

	// Manejar cambios en los campos del formulario
	const onInputChange = (e, name) => {
		const val = (e.target && e.target.value) || "";
		let _product = { ...formData };
		_product[`${name}`] = val;
		dispatch(setFormData(_product));
	};

	// Plantilla para las acciones de la tabla (editar y eliminar)
	const actionBodyTemplate = (rowData) => {
		return (
			<div className='actions' style={{ display: "flex" }}>
				<Button
					icon='pi pi-pencil'
					className='p-button-rounded p-button-success mr-2'
					onClick={() => editProduct(rowData.id)} // Pasar el ID de la sección
				/>
				<Button
					icon='pi pi-trash'
					className='p-button-rounded p-button-warning mr-2'
					onClick={() => confirmDeleteProduct(rowData)}
				/>
			</div>
		);
	};
	const responsiveOptions = [
		{
			breakpoint: "480px",
			numVisible: 2,
			numScroll: 2,
		},
		{
			breakpoint: "480px",
			numVisible: 2,
			numScroll: 2,
		},
		{
			breakpoint: "480px",
			numVisible: 1,
			numScroll: 1,
		},
	];

	const productTemplate = (product) => {
		// console.log(product);
		return (
			<div className='product-item'>
				<div className='product-item-content'>
					<div className='mb-1'>
						<img
							src={`${product.img_dal}`}
							onError={(e) =>
								(e.target.src =
									"https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
							}
							alt={product.name}
							className='product-image'
						/>
					</div>
					<div>
						<div className='car-buttons mt-2'>
							<Button
								icon='pi pi-trash'
								className='p-button p-button-rounded mr-2'
								onClick={() => borrarImagen(product.id)}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const borrarImagen = (idImagen) => {
		setCargando(true);
		setProducts([]);
		datatable
			.getEliminarItem("galeriaimagenesdetalle", formData, idImagen)
			.then((data) =>
				datatable
					.gettable(
						"parametros/galeriaimagenesdetalle/" + formData.id
					)
					.then((datos) => {
						// console.table(datos);
						// console.log(datos.length);
						setProducts(datos);
						setCargando(false);
					})
			);
	};

	return (
		<div className='grid'>
			<div className='col-12'>
				<div className='card'>
					<Cargando cargando={cargando} />
					<Toast ref={toast} />
					<BarraSuperior openNew={openNew} />
					<TablaDatos
						datostabla={dataSet}
						titulo='Secciones de Campaña'>
						<Column
							field='nom_sca'
							header='Nombre'
							sortable
							headerStyle={{ width: "40%", minWidth: "10rem" }}
						/>
						<Column
							field='nom_cam'
							header='Orden'
							sortable
							headerStyle={{ width: "20%", minWidth: "10rem" }}
						/>
						<Column
							field='ord_sca'
							header='Orden'
							sortable
							headerStyle={{ width: "20%", minWidth: "10rem" }}
						/>
						<Column header='Acciones' body={actionBodyTemplate} />
					</TablaDatos>

					<Dialog
						visible={productDialog}
						style={{ width: "850px" }}
						header='Detalle Sección'
						modal={true}
						className='p-fluid'
						footer={productDialogFooter(hideDialog, saveProduct)}
						onHide={hideDialog}>
						<div className='formgrid grid'>
							<div className='field col-8'>
								<label htmlFor='nom_sca'>Nombre</label>
								<InputText
									id='nom_sca'
									value={formData.nom_sca}
									onChange={(e) =>
										onInputChange(e, "nom_sca")
									}
									required
									autoFocus
									className={classNames({
										"p-invalid":
											submitted && !formData.nom_sca,
									})}
								/>
								{submitted && !formData.nom_sca && (
									<small className='p-invalid'>
										Campo requerido.
									</small>
								)}
							</div>
							<div className='field col-4'>
								<label htmlFor='ord_sca'>Orden</label>
								<InputText
									id='ord_sca'
									value={formData.ord_sca}
									onChange={(e) =>
										onInputChange(e, "ord_sca")
									}
									required
								/>
							</div>
						</div>
						<div className='formgrid grid'>
							<div className='field col-12'>
								<label htmlFor='act_cam'>Campaña:</label>
								{/* <Dropdown
									value={formData.cod_cam_sca}
									onChange={(e) => {
										console.log(e.value.id);
										dispatch(
											setFormData({
												...formData,
												cod_cam_sca: e.value.id,
											})
										);
									}}
									options={dropdownCapanias}
									optionLabel='name'
									placeholder='Seleccione'
								/> */}
								<Dropdown
									value={formData.cod_cam_sca}
									onChange={(e) => {
										// console.log(e.value);
										dispatch(
											setFormData({
												...formData,
												cod_cam_sca: e.value,
											})
										);
										console.log({ formData });
									}}
									options={dropdownCapanias}
									optionLabel='name'
									placeholder='Seleccione'
								/>
							</div>
						</div>
						<div className='field'>
							{formData?.id && (
								<ImagenCampo
									label='Imagen'
									formData={formData}
									CampoImagen='img_dal'
									nombreCampo='demo'
									// edicampo={formData.img_not}
									urlupload='/upload/images/galeria'
								/>
							)}
						</div>
						<Divider />
						{products.length > 0 && (
							<div className='carousel-demo'>
								<div className='card'>
									<Carousel
										value={products}
										numVisible={2}
										numScroll={1}
										responsiveOptions={responsiveOptions}
										itemTemplate={productTemplate}
										circular={true}
									/>
								</div>
							</div>
						)}
					</Dialog>
					<EliminarVentana
						deleteProductDialog={deleteProductDialog}
						product={formData.nom_sca}
						hideDeleteProductDialog={hideDeleteProductDialog}
						deleteProduct={deleteProduct}
					/>
				</div>
			</div>
		</div>
	);
};
