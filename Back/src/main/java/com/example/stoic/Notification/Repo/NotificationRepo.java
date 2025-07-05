package com.example.stoic.Notification.Repo;

import com.example.stoic.Notification.Model.Notification;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Integer>, JpaSpecificationExecutor<Notification> {

    List<Notification> findByUserUserIdOrderBySentAt(Integer userId);

    List<Notification> findByUserUserIdAndIsReadFalseOrderBySentAtDesc(Integer userId);

    List<Notification> findByUserUserIdOrderBySentAtDesc(Integer userId);

    Optional<Notification> findById(Integer id);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.userId = :userId AND n.isRead = false")
    int countUnreadNotificationsByUserId(@Param("userId") Integer userId);

    void deleteByUserUserId(Integer userId);

    List<Notification> findByUserUserIdAndIsReadFalse(int userId);
    
    List<Notification> findByUserUserId(int userId);
}
