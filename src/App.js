import React, {useState, useEffect} from 'react';
import {Link, useLocation, useHistory} from 'react-router-dom';
import nl2br from 'react-newline-to-break';

import {HorizontalBar, Doughnut} from "react-chartjs-2";

const options = {
   scales: {
      yAxes: [
         {
            ticks: {
               beginAtZero: true,
            },
         },
      ],
   },
};

const App = () => {
   const [searchValue, setSearchValue] = useState('')
   const [loadingStatus, setLoadingStatus] = useState({
      isLoading: false,
      text: ''
   })
   const [userInfo, setUserInfo] = useState({})
   const [locationBarData, setLocationBarData] = useState([])
   const [cityBarData, setCityBarData] = useState([])
   const [genderDoughnutData, setGenderDoughnutData] = useState([])
   const [commentDoughnutData, setCommentDoughnutData] = useState([])
   const [audienceDoughnutData, setAudienceDoughnutData] = useState([])
   const location = useLocation()
   const history = useHistory()

   useEffect(() => {
      if (location.pathname !== '/') {
         loadUserInfo(location.pathname.slice(1))
      }
   }, [])

   useEffect(() => {
      if (Object.keys(userInfo).length !== 0) {
         setCommentDoughnutData({
            labels: ['Комментарии автора', 'Реальные', 'Короткие', 'Подозрительные'],
            datasets: [
               {
                  data: [
                     userInfo?.comments_type?.author,
                     userInfo?.comments_type?.real,
                     userInfo?.comments_type?.short,
                     userInfo?.comments_type?.suspicious,
                  ],
                  backgroundColor: [
                     '#04C3EC',
                     '#2953C1',
                     '#E3E6F2',
                     '#FF3F1D',
                  ],
               },
            ],
         })

         setAudienceDoughnutData({
            labels: ['Реальных', 'Подозрительных', 'Коммерческие', 'Массфолловеры', 'Инфлюенцеры'],
            datasets: [
               {
                  data: [
                     Math.round(userInfo?.audience_type?.real),
                     Math.round(userInfo?.audience_type?.suspicious),
                     Math.round(userInfo?.audience_type?.commercial),
                     Math.round(userInfo?.audience_type?.mass_followers),
                     Math.round(userInfo?.audience_type?.influencers),
                  ],
                  backgroundColor: [
                     '#2953C1',
                     '#FF3F1D',
                     '#04C3EC',
                     '#E3E6F2',
                     '#90E0E1'
                  ],
               },
            ],
         })

         setGenderDoughnutData({
            labels: ['Мужчины', 'Женщины'],
            datasets: [
               {
                  data: [
                     Math.round(userInfo?.audience_gender?.male),
                     Math.round(userInfo?.audience_gender?.female)
                  ],
                  backgroundColor: [
                     '#00AFD6',
                     '#FFCFF2',
                  ],
                  borderWidth: 1,
               },
            ],
         })

         setCityBarData({
            labels: userInfo.audience_location_city.map(item => item.name),
            datasets: [
               {
                  label: 'По городам',
                  data: userInfo.audience_location_city.map(item => Math.round(item.sum)),
                  backgroundColor: [
                     'rgb(255,124,85, 0.7)',
                     ...userInfo.audience_location_city.slice(1).map(() => 'rgb(255,124,85, 0.2)')
                  ],
                  borderWidth: 1,
               },
            ],
         })

         setLocationBarData({
            labels: userInfo.audience_location_country.slice(0, 10).map(item => item.name),
            datasets: [
               {
                  label: 'По странам',
                  data: userInfo.audience_location_country.slice(0, 10).map(item => Math.round(item.sum)),
                  backgroundColor: [
                     '#007BFF',
                     ...userInfo.audience_location_country.slice(1).map(() => '#8099DA')
                  ],
                  borderWidth: 1,
               },
            ],
         })
      }
   }, [userInfo])

   const handleSubmit = event => {
      event.preventDefault()

      history.push(`/${searchValue}`)
      loadUserInfo(searchValue)
   }

   const loadUserInfo = username => {
      setLoadingStatus({
         text: '',
         isLoading: true,
      })

      fetch('http://134.122.48.238:8000/api/profiles/followers-metricks/', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            username: username
         })
      })
         .then(res => {
            if (res.status === 200) {
               return res.json()
            } else if (res.status === 205) {
               setLoadingStatus({
                  text: 'Производится аналитика пользователя, попробуйте через пару минут',
                  isLoading: false
               })
            } else if (res.status === 404) {
               setLoadingStatus({
                  text: 'Пользователь не найден!',
                  isLoading: false
               })
            }
         })
         .then(data => {
            if (data) {
               setUserInfo(data)
               setLoadingStatus({
                  text: '',
                  isLoading: false
               })
            }
         })
         .catch(() => {
            setUserInfo([])
            setLoadingStatus({
               text: '',
               isLoading: false
            })
         })
   }

   return (
      <main>
         <div className="wrapper">
            <div className="search-user-form mb-5">
               <form onSubmit={handleSubmit}>
                  <div className="flex flex-align-center">
                     <p className="search-user-form-label">@</p>
                     <input
                        type="text"
                        name="username"
                        className="search-user-form-input"
                        placeholder="Введите имя пользователя"
                        onChange={event => setSearchValue(event.target.value)}
                     />
                     <button className="search-user-form-button" type="submit" disabled={!searchValue.length}>
                        <Link to={`/${searchValue}`} className="search-user-form-link" onClick={handleSubmit}>
                           Поиск
                        </Link>
                     </button>
                  </div>
               </form>
            </div>

            {loadingStatus.isLoading || loadingStatus.text.length !== 0 ? (
               <div className="loading">
                  {loadingStatus.isLoading && (
                     <div className="spinner-border text-primary" role="status"/>
                  )}

                  {loadingStatus.text.length !== 0 && (
                     <p className="mt-3">{loadingStatus.text}</p>
                  )}
               </div>
            ) : Object.keys(userInfo).length !== 0 ? (
               <div>
                  <div className="row">
                     <div className="col-md-4 mb-3">
                        <div className="box">
                           <div className="d-flex flex-column align-items-center text-center">
                              <img src={userInfo.profile_pic_url} alt="Admin"
                                   className="rounded-circle user-img" width="150"/>
                              <div className="mt-3">
                                 <h4>{userInfo.full_name}</h4>
                                 <a href={`https://www.instagram.com/${userInfo.username}`} target="_blank"
                                    className="text-primary mb-1">@{userInfo.username}</a>
                                 {userInfo.defined_city && (
                                    <p className="text-muted font-size-sm">{userInfo.defined_city?.country?.name} / {userInfo.defined_city?.name}</p>
                                 )}
                                 <hr/>
                              </div>
                           </div>
                           <div>
                              {userInfo.biography !== '' && (
                                 <p>{nl2br(userInfo.biography)}</p>
                              )}
                              {userInfo.external_url !== '' && (
                                 <p>
                                    <a href={userInfo.external_url} target="_blank"
                                       className="text-primary mb-1">@{userInfo.external_url}</a>
                                 </p>
                              )}
                              <div>
                                 Подписчиков: <strong>{userInfo.follower_count}</strong>
                              </div>
                              <p>
                                 <small>Подписок: <strong>{userInfo.following_count}</strong> |
                                    Подписок: <strong>{userInfo.media_count}</strong></small>
                              </p>
                           </div>
                        </div>
                     </div>
                     <div className="col-md-8">
                        <div className="box mb-4">
                           <h4>Информация</h4>
                           <div className="row">
                              <div className="col-sm-6">
                                 <h6 className="mb-0">Вовлеченность аудитории (ER)</h6>
                              </div>
                              <div className="col-sm-3">
                                 <strong>{userInfo.engagement_rate || '-'}</strong>
                              </div>
                           </div>
                           <hr/>
                           <div className="row">
                              <div className="col-sm-6">
                                 <h6 className="mb-0">Качественная аудитория</h6>
                              </div>
                              <div className="col-sm-3">
                                 <strong>{userInfo.audience_quality}</strong>
                              </div>
                           </div>
                           <hr/>
                           <div className="row">
                              <div className="col-sm-6">
                                 <h6 className="mb-0">Лайков на пост</h6>
                              </div>
                              <div className="col-sm-3">
                                 <strong>{userInfo.average_likes_count}</strong>
                              </div>
                           </div>
                           <hr/>
                           {/*<div className="row">*/}
                           {/*   <div className="col-sm-6">*/}
                           {/*      <h6 className="mb-0">Комментов на пост</h6>*/}
                           {/*   </div>*/}
                           {/*   <div className="col-sm-3">*/}
                           {/*      <strong>-</strong>*/}
                           {/*   </div>*/}
                           {/*</div>*/}
                           {/*<hr/>*/}
                           {/*<div className="row">*/}
                           {/*   <div className="col-sm-6">*/}
                           {/*      <h6 className="mb-0">Просмотров видео</h6>*/}
                           {/*   </div>*/}
                           {/*   <div className="col-sm-3">*/}
                           {/*      <strong>-</strong>*/}
                           {/*   </div>*/}
                           {/*</div>*/}
                           {/*<hr/>*/}
                        </div>
                        {/**TODO Uncomment when back was ready **/}
                        {/*<div className="box mb-3">*/}
                        {/*   <h4 className="mb-4">Публикаций</h4>*/}

                        {/*   <div className="gallery flex">*/}
                        {/*      <div className="gallery-item">*/}
                        {/*         <div className="gallery-item__img">*/}
                        {/*            <img*/}
                        {/*               src="https://instagram.fala6-1.fna.fbcdn.net/v/t51.2885-15/e35/p1080x1080/129737474_235598997914339_4982986648865344617_n.jpg?_nc_ht=instagram.fala6-1.fna.fbcdn.net&_nc_cat=111&_nc_ohc=iONHHJwMFpEAX-LqDZj&tp=1&oh=9ec01bd43869486066dc16ef7d8aae0c&oe=5FFCAFBF"*/}
                        {/*               alt=""/>*/}
                        {/*         </div>*/}
                        {/*         <div className="gallery-item__icon">*/}
                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M7.2197,6 C6.3557,6 5.5457,6.334 4.9397,6.941 C3.6817,8.201 3.6817,10.252 4.9407,11.514 L11.9997,18.585 L19.0597,11.514 C20.3187,10.252 20.3187,8.201 19.0597,6.941 C17.8477,5.726 15.7117,5.728 14.4997,6.941 L12.7077,8.736 C12.3317,9.113 11.6677,9.113 11.2917,8.736 L9.4997,6.94 C8.8937,6.334 8.0847,6 7.2197,6 M11.9997,21 L11.9997,21 C11.7347,21 11.4797,20.895 11.2927,20.706 L3.5247,12.926 C1.4887,10.886 1.4887,7.567 3.5247,5.527 C4.5087,4.543 5.8207,4 7.2197,4 C8.6187,4 9.9317,4.543 10.9147,5.527 L11.9997,6.614 L13.0847,5.528 C14.0687,4.543 15.3807,4 16.7807,4 C18.1787,4 19.4917,4.543 20.4747,5.527 C22.5117,7.567 22.5117,10.886 20.4757,12.926 L12.7077,20.707 C12.5197,20.895 12.2657,21 11.9997,21"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>164</span>*/}
                        {/*            </div>*/}

                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M12,9 C12.552,9 13,9.448 13,10 C13,10.552 12.552,11 12,11 C11.448,11 11,10.552 11,10 C11,9.448 11.448,9 12,9 Z M16,9 C16.552,9 17,9.448 17,10 C17,10.552 16.552,11 16,11 C15.448,11 15,10.552 15,10 C15,9.448 15.448,9 16,9 Z M8,9 C8.552,9 9,9.448 9,10 C9,10.552 8.552,11 8,11 C7.448,11 7,10.552 7,10 C7,9.448 7.448,9 8,9 Z M20,15 C20,15.551 19.551,16 19,16 L8.554,16 C8.011,16 7.477,16.148 7.01,16.428 L4,18.234 L4,5 C4,4.449 4.449,4 5,4 L19,4 C19.551,4 20,4.449 20,5 L20,15 Z M19,2 L5,2 C3.346,2 2,3.346 2,5 L2,20 C2,20.36 2.194,20.693 2.507,20.87 C2.66,20.957 2.83,21 3,21 C3.178,21 3.356,20.953 3.515,20.857 L8.039,18.143 C8.195,18.049 8.373,18 8.554,18 L19,18 C20.654,18 22,16.654 22,15 L22,5 C22,3.346 20.654,2 19,2 L19,2 Z"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>7</span>*/}
                        {/*            </div>*/}

                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M12,13.5 C11.173,13.5 10.5,12.827 10.5,12 C10.5,11.173 11.173,10.5 12,10.5 C12.827,10.5 13.5,11.173 13.5,12 C13.5,12.827 12.827,13.5 12,13.5 M12,8.5 C10.07,8.5 8.5,10.07 8.5,12 C8.5,13.93 10.07,15.5 12,15.5 C13.93,15.5 15.5,13.93 15.5,12 C15.5,10.07 13.93,8.5 12,8.5 M12.2197,16.9976 C7.9137,17.0976 5.1047,13.4146 4.1727,11.9956 C5.1987,10.3906 7.7827,7.1046 11.7807,7.0026 C16.0697,6.8936 18.8947,10.5856 19.8267,12.0046 C18.8017,13.6096 16.2167,16.8956 12.2197,16.9976 M21.8677,11.5026 C21.2297,10.3906 17.7057,4.8166 11.7297,5.0036 C6.2017,5.1436 2.9867,10.0136 2.1327,11.5026 C1.9557,11.8106 1.9557,12.1896 2.1327,12.4976 C2.7617,13.5946 6.1617,18.9996 12.0247,18.9996 C12.1067,18.9996 12.1887,18.9986 12.2707,18.9966 C17.7977,18.8556 21.0137,13.9866 21.8677,12.4976 C22.0437,12.1896 22.0437,11.8106 21.8677,11.5026"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>792</span>*/}
                        {/*            </div>*/}
                        {/*         </div>*/}
                        {/*      </div>*/}
                        {/*      <div className="gallery-item">*/}
                        {/*         <div className="gallery-item__img">*/}
                        {/*            <img*/}
                        {/*               src="https://instagram.fala6-1.fna.fbcdn.net/v/t51.2885-15/e35/p1080x1080/129737474_235598997914339_4982986648865344617_n.jpg?_nc_ht=instagram.fala6-1.fna.fbcdn.net&_nc_cat=111&_nc_ohc=iONHHJwMFpEAX-LqDZj&tp=1&oh=9ec01bd43869486066dc16ef7d8aae0c&oe=5FFCAFBF"*/}
                        {/*               alt=""/>*/}
                        {/*         </div>*/}
                        {/*         <div className="gallery-item__icon">*/}
                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M7.2197,6 C6.3557,6 5.5457,6.334 4.9397,6.941 C3.6817,8.201 3.6817,10.252 4.9407,11.514 L11.9997,18.585 L19.0597,11.514 C20.3187,10.252 20.3187,8.201 19.0597,6.941 C17.8477,5.726 15.7117,5.728 14.4997,6.941 L12.7077,8.736 C12.3317,9.113 11.6677,9.113 11.2917,8.736 L9.4997,6.94 C8.8937,6.334 8.0847,6 7.2197,6 M11.9997,21 L11.9997,21 C11.7347,21 11.4797,20.895 11.2927,20.706 L3.5247,12.926 C1.4887,10.886 1.4887,7.567 3.5247,5.527 C4.5087,4.543 5.8207,4 7.2197,4 C8.6187,4 9.9317,4.543 10.9147,5.527 L11.9997,6.614 L13.0847,5.528 C14.0687,4.543 15.3807,4 16.7807,4 C18.1787,4 19.4917,4.543 20.4747,5.527 C22.5117,7.567 22.5117,10.886 20.4757,12.926 L12.7077,20.707 C12.5197,20.895 12.2657,21 11.9997,21"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>164</span>*/}
                        {/*            </div>*/}

                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M12,9 C12.552,9 13,9.448 13,10 C13,10.552 12.552,11 12,11 C11.448,11 11,10.552 11,10 C11,9.448 11.448,9 12,9 Z M16,9 C16.552,9 17,9.448 17,10 C17,10.552 16.552,11 16,11 C15.448,11 15,10.552 15,10 C15,9.448 15.448,9 16,9 Z M8,9 C8.552,9 9,9.448 9,10 C9,10.552 8.552,11 8,11 C7.448,11 7,10.552 7,10 C7,9.448 7.448,9 8,9 Z M20,15 C20,15.551 19.551,16 19,16 L8.554,16 C8.011,16 7.477,16.148 7.01,16.428 L4,18.234 L4,5 C4,4.449 4.449,4 5,4 L19,4 C19.551,4 20,4.449 20,5 L20,15 Z M19,2 L5,2 C3.346,2 2,3.346 2,5 L2,20 C2,20.36 2.194,20.693 2.507,20.87 C2.66,20.957 2.83,21 3,21 C3.178,21 3.356,20.953 3.515,20.857 L8.039,18.143 C8.195,18.049 8.373,18 8.554,18 L19,18 C20.654,18 22,16.654 22,15 L22,5 C22,3.346 20.654,2 19,2 L19,2 Z"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>7</span>*/}
                        {/*            </div>*/}

                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M12,13.5 C11.173,13.5 10.5,12.827 10.5,12 C10.5,11.173 11.173,10.5 12,10.5 C12.827,10.5 13.5,11.173 13.5,12 C13.5,12.827 12.827,13.5 12,13.5 M12,8.5 C10.07,8.5 8.5,10.07 8.5,12 C8.5,13.93 10.07,15.5 12,15.5 C13.93,15.5 15.5,13.93 15.5,12 C15.5,10.07 13.93,8.5 12,8.5 M12.2197,16.9976 C7.9137,17.0976 5.1047,13.4146 4.1727,11.9956 C5.1987,10.3906 7.7827,7.1046 11.7807,7.0026 C16.0697,6.8936 18.8947,10.5856 19.8267,12.0046 C18.8017,13.6096 16.2167,16.8956 12.2197,16.9976 M21.8677,11.5026 C21.2297,10.3906 17.7057,4.8166 11.7297,5.0036 C6.2017,5.1436 2.9867,10.0136 2.1327,11.5026 C1.9557,11.8106 1.9557,12.1896 2.1327,12.4976 C2.7617,13.5946 6.1617,18.9996 12.0247,18.9996 C12.1067,18.9996 12.1887,18.9986 12.2707,18.9966 C17.7977,18.8556 21.0137,13.9866 21.8677,12.4976 C22.0437,12.1896 22.0437,11.8106 21.8677,11.5026"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>792</span>*/}
                        {/*            </div>*/}
                        {/*         </div>*/}
                        {/*      </div>*/}
                        {/*      <div className="gallery-item">*/}
                        {/*         <div className="gallery-item__img">*/}
                        {/*            <img*/}
                        {/*               src="https://instagram.fala6-1.fna.fbcdn.net/v/t51.2885-15/e35/p1080x1080/129737474_235598997914339_4982986648865344617_n.jpg?_nc_ht=instagram.fala6-1.fna.fbcdn.net&_nc_cat=111&_nc_ohc=iONHHJwMFpEAX-LqDZj&tp=1&oh=9ec01bd43869486066dc16ef7d8aae0c&oe=5FFCAFBF"*/}
                        {/*               alt=""/>*/}
                        {/*         </div>*/}
                        {/*         <div className="gallery-item__icon">*/}
                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M7.2197,6 C6.3557,6 5.5457,6.334 4.9397,6.941 C3.6817,8.201 3.6817,10.252 4.9407,11.514 L11.9997,18.585 L19.0597,11.514 C20.3187,10.252 20.3187,8.201 19.0597,6.941 C17.8477,5.726 15.7117,5.728 14.4997,6.941 L12.7077,8.736 C12.3317,9.113 11.6677,9.113 11.2917,8.736 L9.4997,6.94 C8.8937,6.334 8.0847,6 7.2197,6 M11.9997,21 L11.9997,21 C11.7347,21 11.4797,20.895 11.2927,20.706 L3.5247,12.926 C1.4887,10.886 1.4887,7.567 3.5247,5.527 C4.5087,4.543 5.8207,4 7.2197,4 C8.6187,4 9.9317,4.543 10.9147,5.527 L11.9997,6.614 L13.0847,5.528 C14.0687,4.543 15.3807,4 16.7807,4 C18.1787,4 19.4917,4.543 20.4747,5.527 C22.5117,7.567 22.5117,10.886 20.4757,12.926 L12.7077,20.707 C12.5197,20.895 12.2657,21 11.9997,21"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>164</span>*/}
                        {/*            </div>*/}

                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M12,9 C12.552,9 13,9.448 13,10 C13,10.552 12.552,11 12,11 C11.448,11 11,10.552 11,10 C11,9.448 11.448,9 12,9 Z M16,9 C16.552,9 17,9.448 17,10 C17,10.552 16.552,11 16,11 C15.448,11 15,10.552 15,10 C15,9.448 15.448,9 16,9 Z M8,9 C8.552,9 9,9.448 9,10 C9,10.552 8.552,11 8,11 C7.448,11 7,10.552 7,10 C7,9.448 7.448,9 8,9 Z M20,15 C20,15.551 19.551,16 19,16 L8.554,16 C8.011,16 7.477,16.148 7.01,16.428 L4,18.234 L4,5 C4,4.449 4.449,4 5,4 L19,4 C19.551,4 20,4.449 20,5 L20,15 Z M19,2 L5,2 C3.346,2 2,3.346 2,5 L2,20 C2,20.36 2.194,20.693 2.507,20.87 C2.66,20.957 2.83,21 3,21 C3.178,21 3.356,20.953 3.515,20.857 L8.039,18.143 C8.195,18.049 8.373,18 8.554,18 L19,18 C20.654,18 22,16.654 22,15 L22,5 C22,3.346 20.654,2 19,2 L19,2 Z"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>7</span>*/}
                        {/*            </div>*/}

                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M12,13.5 C11.173,13.5 10.5,12.827 10.5,12 C10.5,11.173 11.173,10.5 12,10.5 C12.827,10.5 13.5,11.173 13.5,12 C13.5,12.827 12.827,13.5 12,13.5 M12,8.5 C10.07,8.5 8.5,10.07 8.5,12 C8.5,13.93 10.07,15.5 12,15.5 C13.93,15.5 15.5,13.93 15.5,12 C15.5,10.07 13.93,8.5 12,8.5 M12.2197,16.9976 C7.9137,17.0976 5.1047,13.4146 4.1727,11.9956 C5.1987,10.3906 7.7827,7.1046 11.7807,7.0026 C16.0697,6.8936 18.8947,10.5856 19.8267,12.0046 C18.8017,13.6096 16.2167,16.8956 12.2197,16.9976 M21.8677,11.5026 C21.2297,10.3906 17.7057,4.8166 11.7297,5.0036 C6.2017,5.1436 2.9867,10.0136 2.1327,11.5026 C1.9557,11.8106 1.9557,12.1896 2.1327,12.4976 C2.7617,13.5946 6.1617,18.9996 12.0247,18.9996 C12.1067,18.9996 12.1887,18.9986 12.2707,18.9966 C17.7977,18.8556 21.0137,13.9866 21.8677,12.4976 C22.0437,12.1896 22.0437,11.8106 21.8677,11.5026"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>792</span>*/}
                        {/*            </div>*/}
                        {/*         </div>*/}
                        {/*      </div>*/}
                        {/*      <div className="gallery-item">*/}
                        {/*         <div className="gallery-item__img">*/}
                        {/*            <img*/}
                        {/*               src="https://instagram.fala6-1.fna.fbcdn.net/v/t51.2885-15/e35/p1080x1080/129737474_235598997914339_4982986648865344617_n.jpg?_nc_ht=instagram.fala6-1.fna.fbcdn.net&_nc_cat=111&_nc_ohc=iONHHJwMFpEAX-LqDZj&tp=1&oh=9ec01bd43869486066dc16ef7d8aae0c&oe=5FFCAFBF"*/}
                        {/*               alt=""/>*/}
                        {/*         </div>*/}
                        {/*         <div className="gallery-item__icon">*/}
                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M7.2197,6 C6.3557,6 5.5457,6.334 4.9397,6.941 C3.6817,8.201 3.6817,10.252 4.9407,11.514 L11.9997,18.585 L19.0597,11.514 C20.3187,10.252 20.3187,8.201 19.0597,6.941 C17.8477,5.726 15.7117,5.728 14.4997,6.941 L12.7077,8.736 C12.3317,9.113 11.6677,9.113 11.2917,8.736 L9.4997,6.94 C8.8937,6.334 8.0847,6 7.2197,6 M11.9997,21 L11.9997,21 C11.7347,21 11.4797,20.895 11.2927,20.706 L3.5247,12.926 C1.4887,10.886 1.4887,7.567 3.5247,5.527 C4.5087,4.543 5.8207,4 7.2197,4 C8.6187,4 9.9317,4.543 10.9147,5.527 L11.9997,6.614 L13.0847,5.528 C14.0687,4.543 15.3807,4 16.7807,4 C18.1787,4 19.4917,4.543 20.4747,5.527 C22.5117,7.567 22.5117,10.886 20.4757,12.926 L12.7077,20.707 C12.5197,20.895 12.2657,21 11.9997,21"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>164</span>*/}
                        {/*            </div>*/}

                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M12,9 C12.552,9 13,9.448 13,10 C13,10.552 12.552,11 12,11 C11.448,11 11,10.552 11,10 C11,9.448 11.448,9 12,9 Z M16,9 C16.552,9 17,9.448 17,10 C17,10.552 16.552,11 16,11 C15.448,11 15,10.552 15,10 C15,9.448 15.448,9 16,9 Z M8,9 C8.552,9 9,9.448 9,10 C9,10.552 8.552,11 8,11 C7.448,11 7,10.552 7,10 C7,9.448 7.448,9 8,9 Z M20,15 C20,15.551 19.551,16 19,16 L8.554,16 C8.011,16 7.477,16.148 7.01,16.428 L4,18.234 L4,5 C4,4.449 4.449,4 5,4 L19,4 C19.551,4 20,4.449 20,5 L20,15 Z M19,2 L5,2 C3.346,2 2,3.346 2,5 L2,20 C2,20.36 2.194,20.693 2.507,20.87 C2.66,20.957 2.83,21 3,21 C3.178,21 3.356,20.953 3.515,20.857 L8.039,18.143 C8.195,18.049 8.373,18 8.554,18 L19,18 C20.654,18 22,16.654 22,15 L22,5 C22,3.346 20.654,2 19,2 L19,2 Z"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>7</span>*/}
                        {/*            </div>*/}

                        {/*            <div className="gallery-item-icon__item">*/}
                        {/*               <svg className="MuiSvgIcon-root jss243" focusable="false" viewBox="0 0 24 24"*/}
                        {/*                    aria-hidden="true">*/}
                        {/*                  <path*/}
                        {/*                     d="M12,13.5 C11.173,13.5 10.5,12.827 10.5,12 C10.5,11.173 11.173,10.5 12,10.5 C12.827,10.5 13.5,11.173 13.5,12 C13.5,12.827 12.827,13.5 12,13.5 M12,8.5 C10.07,8.5 8.5,10.07 8.5,12 C8.5,13.93 10.07,15.5 12,15.5 C13.93,15.5 15.5,13.93 15.5,12 C15.5,10.07 13.93,8.5 12,8.5 M12.2197,16.9976 C7.9137,17.0976 5.1047,13.4146 4.1727,11.9956 C5.1987,10.3906 7.7827,7.1046 11.7807,7.0026 C16.0697,6.8936 18.8947,10.5856 19.8267,12.0046 C18.8017,13.6096 16.2167,16.8956 12.2197,16.9976 M21.8677,11.5026 C21.2297,10.3906 17.7057,4.8166 11.7297,5.0036 C6.2017,5.1436 2.9867,10.0136 2.1327,11.5026 C1.9557,11.8106 1.9557,12.1896 2.1327,12.4976 C2.7617,13.5946 6.1617,18.9996 12.0247,18.9996 C12.1067,18.9996 12.1887,18.9986 12.2707,18.9966 C17.7977,18.8556 21.0137,13.9866 21.8677,12.4976 C22.0437,12.1896 22.0437,11.8106 21.8677,11.5026"/>*/}
                        {/*               </svg>*/}

                        {/*               <span>792</span>*/}
                        {/*            </div>*/}
                        {/*         </div>*/}
                        {/*      </div>*/}
                        {/*   </div>*/}

                        {/*   /!*<div className="row">*!/*/}
                        {/*   /!*   <div className="col-sm-6">*!/*/}
                        {/*   /!*      <h6 className="mb-0">Комментов на пост</h6>*!/*/}
                        {/*   /!*   </div>*!/*/}
                        {/*   /!*   <div className="col-sm-3">*!/*/}
                        {/*   /!*      <strong>-</strong>*!/*/}
                        {/*   /!*   </div>*!/*/}
                        {/*   /!*</div>*!/*/}
                        {/*   /!*<hr/>*!/*/}
                        {/*   /!*<div className="row">*!/*/}
                        {/*   /!*   <div className="col-sm-6">*!/*/}
                        {/*   /!*      <h6 className="mb-0">Просмотров видео</h6>*!/*/}
                        {/*   /!*   </div>*!/*/}
                        {/*   /!*   <div className="col-sm-3">*!/*/}
                        {/*   /!*      <strong>-</strong>*!/*/}
                        {/*   /!*   </div>*!/*/}
                        {/*   /!*</div>*!/*/}
                        {/*   /!*<hr/>*!/*/}
                        {/*</div>*/}

                        {/*<div className="box mt-3">*/}
                        {/*   <h4>Тип аудиторий</h4>*/}
                        {/*   <ul className="list-group list-group-flush">*/}
                        {/*      <li*/}
                        {/*         className="list-group-item d-flex justify-content-between align-items-center flex-wrap">*/}
                        {/*         <h6 className="mb-0">*/}
                        {/*            Реальных*/}
                        {/*         </h6>*/}
                        {/*         <span><strong>{parseInt(userInfo.audience_type.real)}</strong></span>*/}
                        {/*      </li>*/}
                        {/*      <li*/}
                        {/*         className="list-group-item d-flex justify-content-between align-items-center flex-wrap">*/}
                        {/*         <h6 className="mb-0">*/}
                        {/*            Подозрительных*/}
                        {/*         </h6>*/}
                        {/*         <span><strong>{parseInt(userInfo.audience_type.suspicious)}</strong></span>*/}
                        {/*      </li>*/}
                        {/*      <li*/}
                        {/*         className="list-group-item d-flex justify-content-between align-items-center flex-wrap">*/}
                        {/*         <h6 className="mb-0">*/}
                        {/*            Коммерческие*/}
                        {/*         </h6>*/}
                        {/*         <span><strong>{parseInt(userInfo.audience_type.commercial)}</strong></span>*/}
                        {/*      </li>*/}
                        {/*      <li*/}
                        {/*         className="list-group-item d-flex justify-content-between align-items-center flex-wrap">*/}
                        {/*         <h6 className="mb-0">*/}
                        {/*            Массфолловеры*/}
                        {/*         </h6>*/}
                        {/*         <span><strong>{parseInt(userInfo.audience_type.mass_followers)}</strong></span>*/}
                        {/*      </li>*/}
                        {/*      <li*/}
                        {/*         className="list-group-item d-flex justify-content-between align-items-center flex-wrap">*/}
                        {/*         <h6 className="mb-0">*/}
                        {/*            Инфлюенцеры*/}
                        {/*         </h6>*/}
                        {/*         <span><strong>{parseInt(userInfo.audience_type.influencers)}</strong></span>*/}
                        {/*      </li>*/}
                        {/*   </ul>*/}
                        {/*</div>*/}
                     </div>
                  </div>

                  <hr/>

                  <h4 className="title">Анализ аудиторий</h4>

                  <div className="audition">
                     <div className="audition-section flex j-sb">
                        <div className="box audition-item">
                           <h5>Доступность аудитории</h5>

                           <div className="audition-item__info flex flex-align-center">
                              <p className="audition-item-info__icon">{userInfo.audience_accessibility}%</p>

                              <p className="audition-item-info__text">
                                 <strong>{userInfo.audience_accessibility}%</strong> аудитории имеют менее 1500 подписок
                              </p>
                           </div>
                        </div>

                        <div className="box audition-item">
                           <h5>Подлинность аудитории</h5>

                           <div className="audition-item__info flex flex-align-center">
                              <p className="audition-item-info__icon">{userInfo.audience_authenticity}%</p>

                              <p className="audition-item-info__text">
                                 <strong>{userInfo.audience_authenticity}%</strong> аудитории выглядят достоверно
                              </p>
                           </div>
                        </div>

                        <div className="box audition-item">
                           <h5>Среднее количество лайков</h5>

                           <div className="audition-item__info flex flex-align-center">
                              <p className="audition-item-info__icon">{userInfo.average_likes_count || 0}</p>

                              <p className="audition-item-info__text">
                                 <strong>{userInfo.average_likes_count || 0} лайков</strong> на пост
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="audition-section flex j-sb">
                        <div className="audition-chart-item box">
                           <h5>Аудитория по странам</h5>

                           <HorizontalBar data={locationBarData} options={options}/>
                        </div>

                        <div className="audition-chart-item box">
                           <h5>Комментарии по типу</h5>

                           <Doughnut data={commentDoughnutData}/>
                        </div>
                     </div>

                     <div className="audition-section flex j-sb">
                        <div className="audition-chart-item box">
                           <h5>Пол аудитории</h5>

                           <Doughnut data={genderDoughnutData}/>
                        </div>

                        <div className="audition-chart-item box">
                           <h5>Тип аудитории</h5>

                           <Doughnut data={audienceDoughnutData}/>
                        </div>
                     </div>

                     <div className="audition-section">
                        <div className="box">
                           <h5>Аудитория по городам</h5>

                           <HorizontalBar data={cityBarData} options={options}/>
                        </div>
                     </div>

                     <div className="audition-section">
                        <div className="comment box flex">
                           <h5 className="comment-text">
                              Лайкающих и Комментирующих <br/>
                              с более чем 2000 подписчиками
                           </h5>

                           <div className="comment-rating">
                              <div className="comment-rating-box">
                                 <p>Лайкающих: <strong>{userInfo.liked_users_followers_gt_2000}%</strong></p>

                                 <div className="comment-rating__line">
                                    <div className="progress" style={{height: "8px"}}>
                                       <div className="progress-bar bg-primary" role="progressbar"
                                            style={{width: `${userInfo.liked_users_followers_gt_2000}px`}}
                                            aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"/>
                                    </div>
                                 </div>
                              </div>

                              <div className="comment-rating-box">
                                 <p>Комментирующих: <strong>{userInfo.commented_users_followers_gt_2000}%</strong></p>

                                 <div className="comment-rating__line">
                                    <div className="progress" style={{height: "8px"}}>
                                       <div className="progress-bar bg-primary" role="progressbar"
                                            style={{width: `${userInfo.commented_users_followers_gt_2000}px`}}
                                            aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"/>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                     </div>

                     <div className="audition-section">
                        <div className="comment box flex">
                           <h5 className="comment-text">
                              Лайкающих и Комментирующих <br/>
                              с более чем 2000 подписками
                           </h5>

                           <div className="comment-rating">
                              <div className="comment-rating-box">
                                 <p>Лайкающих: <strong>{userInfo.liked_users_following_gt_2000}%</strong></p>

                                 <div className="comment-rating__line">
                                    <div className="progress" style={{height: "8px"}}>
                                       <div className="progress-bar bg-primary" role="progressbar"
                                            style={{width: `${userInfo.liked_users_following_gt_2000}%`}}
                                            aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"/>
                                    </div>
                                 </div>
                              </div>

                              <div className="comment-rating-box">
                                 <p>Комментирующих: <strong>{userInfo.commented_users_following_gt_2000}%</strong></p>

                                 <div className="comment-rating__line">
                                    <div className="progress" style={{height: '8px'}}>
                                       <div className="progress-bar bg-primary" role="progressbar"
                                            style={{width: `${userInfo.commented_users_following_gt_2000}px`}}
                                            aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"/>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                     </div>

                     <div className="audition-section">
                        <div className="comment box flex flex-align-center">
                           <h5 className="comment-text">
                              Комментирующих <br/>
                              с количеством подписчиков менее 1000
                           </h5>

                           <div className="comment-rating">
                              <div className="comment-rating-box">
                                 <p>Комментирующих: <strong>{userInfo.commented_users_followers_lt_1000}%</strong></p>

                                 <div className="comment-rating__line">
                                    <div className="progress" style={{height: "8px"}}>
                                       <div className="progress-bar bg-primary" role="progressbar"
                                            style={{width: `${userInfo.commented_users_followers_lt_1000}%`}}
                                            aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"/>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                     </div>
                  </div>
               </div>
            ) : (
               <div className="alert alert-primary" role="alert">
                  Введите имя пользователя!
               </div>
            )}
         </div>
      </main>
   );
};

export default App;