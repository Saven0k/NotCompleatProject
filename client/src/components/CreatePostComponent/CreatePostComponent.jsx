import './CreatePostComponent.css'
import React, { useState, useRef, useEffect } from 'react';
import GroupSelector from '../Selectors/GroupSelector/GroupSelector';
import { addPost } from '../../services/ApiToServer/posts';
import CitySelector from '../Selectors/CitySelector/CitySelector';
import FormSelector from '../Selectors/FormSelector/FormSelector';


const CreatePostComponent = () => {

    const [role, setRole] = useState(''); //UseState for type of visible
    const [title, setTitle] = useState(''); // UseState for Posts title
    const [content, setContent] = useState(''); // UseState for Posts content
    const [status, setStatus] = useState(false); // UseState for visible content
    const [role_context, setRoleContext] = useState(["null"])
    const [styles, setStyles] = useState({
        color: '#000000',
        fontSize: '16px',
        fontWeight: 'normal',
        fontStyle: 'normal',
    }); // UseState for contents styles

    const editorRef = useRef(null); // UseRef for edit content
    const lastSelectionRef = useRef(null); // Сохраняем последнюю позицию курсора
    const [imagePreview, setImagePreview] = useState(''); // Для превью изображения
    const [image, setImage] = useState(null);
    const saveTimeoutRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState(null);


    const startSaveTimer = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            lastSelectionRef.current = selection.getRangeAt(0);
        }

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);


        setTimeLeft(2);
        countdownIntervalRef.current = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);


        saveTimeoutRef.current = setTimeout(() => {
            if (editorRef.current && editorRef.current.innerHTML !== content) {
                const newContent = editorRef.current.innerHTML;
                setContent(newContent);
            }
            setTimeLeft(null);
            clearInterval(countdownIntervalRef.current);
        }, 2000);
    };


    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, []);
    // Восстанавливаем выделение (курсор)
    const restoreSelection = () => {
        if (lastSelectionRef.current) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(lastSelectionRef.current);
        }
    };

    // Применить стиль к выделенному тексту
    const applyStyleToSelection = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        const span = document.createElement('span');
        span.style.color = styles.color;
        span.style.fontSize = styles.fontSize;
        span.style.fontWeight = styles.fontWeight;
        span.style.fontStyle = styles.fontStyle;
        span.textContent = selectedText;

        range.deleteContents();
        range.insertNode(span);

        // Обновляем состояние content
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
        restoreSelection(); // Восстанавливаем курсор
        setStyles({ ...styles, color: '#000000', fontSize: '14px', fontWeight: 'normal', fontStyle: 'normal' })

    };

    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setImage(selectedFile);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };
    // Функция для очистки
    const clearImage = () => {
        setImage("");
        setImagePreview('');
        // Сбрасываем значение инпута через ref
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Это разблокирует повторный выбор файла
        }
    };

    // Автоматически применяем стили при их изменении
    useEffect(() => {
        applyStyleToSelection();
    }, [styles.color, styles.fontSize, styles.fontWeight, styles.fontStyle]);

    // Сохраняем пост на сервер
    const savePost = () => {

        if (image !== null) {
            const data = new FormData();
            data.append('title', title);
            data.append('content', content);
            data.append('role', role);
            data.append('role_context', role_context);
            data.append('status', status ? "1" : "0");
            data.append('file', image);
            addPost(data)
        }

        setTitle('');
        setContent('');
        clearImage()
        setRole("null")
        setRoleContext("null")
    };


    return (
        <div className='addPost_component'>
            <div className='image_load'>
                <label htmlFor="image">Image</label>
                <input
                    ref={fileInputRef} // Привязываем ref
                    type="file"
                    name="image"
                    id="image"
                    onChange={(e) => handleFileChange(e)}
                    accept="image/*"
                />
                {imagePreview && (
                    <>
                        <img src={imagePreview} alt="preview" className='image_preview' />
                        <button className="button_delete_photo" onClick={clearImage}>Удалить</button>
                    </>
                )}
            </div>
            <input
                type="text"
                placeholder="Заголовок поста"
                value={title}
                className='title_input'
                onChange={(e) => setTitle(e.target.value)}
            />
            {timeLeft !== null && (
                <div className="save-countdown">
                    {timeLeft > 0 ? (
                        <span>Текст сохранится через {timeLeft} сек...</span>
                    ) : (
                        <span>✓ Сохранено</span>
                    )}
                </div>
            )}
            <div
                ref={editorRef}
                contentEditable
                onBlur={startSaveTimer}
                onMouseUp={startSaveTimer}
                onKeyUp={startSaveTimer}
                dangerouslySetInnerHTML={{ __html: content }}
                className="content_input"
            />
            <div className='style_component'>
                <h3>Стили:</h3>
                <div className='styles_buttons'>
                    <input
                        type="color"
                        value={styles.color}
                        onChange={(e) => setStyles({ ...styles, color: e.target.value })}
                    />
                    <select
                        value={styles.fontSize}
                        onChange={(e) => setStyles({ ...styles, fontSize: e.target.value })}
                    >
                        <option value="12px">12px</option>
                        <option value="16px">16px</option>
                        <option value="20px">20px</option>
                    </select>
                    <button
                        className='bold_button'
                        onClick={() =>
                            setStyles({
                                ...styles,
                                fontWeight: styles.fontWeight === 'bold' ? 'normal' : 'bold',
                            })
                        }
                    >
                        Ж
                    </button>
                    <button
                        onClick={() =>
                            setStyles({
                                ...styles,
                                fontStyle: styles.fontStyle === 'italic' ? 'normal' : 'italic',
                            })
                        }
                    >
                        К
                    </button>
                </div>
            </div>
            <div className='selection_component'>
                <select
                    className='visible_select'
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="a">Не выбрано</option>
                    <option value="form">По форме обучения</option>
                    <option value="student">Студентам</option>
                    <option value="teacher">Учителям</option>
                    <option value="all">Всем</option>
                    <option value="city">Городу</option>
                </select>
                {role === 'student' &&
                    <GroupSelector saveGroupList={setRoleContext} />
                }
                {role === 'city' &&
                    <CitySelector saveCity={setRoleContext} />
                }
                {role === 'form' &&
                    <FormSelector saveForm={setRoleContext} />
                }
            </div>
            <div className="modal-form-group">
                <label>
                    <input
                        type="checkbox"
                        name="publicPost"
                        checked={status} // Добавляем привязку к состоянию
                        onChange={(e) => setStatus(e.target.checked)}
                    />
                    Публичный пост
                </label>
            </div>
            <button className='button_save_post' disabled={image ? false : true} onClick={savePost}>Сохранить пост</button>
        </div>
    );
};

export default CreatePostComponent;